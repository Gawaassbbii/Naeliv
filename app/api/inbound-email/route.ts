import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Webhook } from 'svix';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';
import { verifyResendSignature, verifyMailgunSignature } from '@/lib/security/webhook-verification';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { 
  isValidEmail, 
  sanitizeText, 
  sanitizeHTML, 
  sanitizeSubject, 
  extractPreview,
  validateEmailSize 
} from '@/lib/security/email-validation';
import { detectSpam, isBlacklisted } from '@/lib/security/spam-detection';
import { inboundEmailSchema } from '@/lib/validations/email';
import { sanitizeEmailHTML } from '@/lib/utils/email-sanitize';

// Configuration de sécurité
const MAX_EMAIL_SIZE = 25 * 1024 * 1024; // 25MB
const RATE_LIMIT_MAX = 100; // Max 100 emails par minute par IP
const RATE_LIMIT_WINDOW = 60000; // 1 minute

// Client Resend pour récupérer le contenu des emails
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Créer un client Supabase avec service role key pour contourner RLS dans l'API
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qmwcvaaviheclxgerdgq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client avec service role key (contourne RLS) - UNIQUEMENT pour l'API webhook
const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

/**
 * Endpoint sécurisé pour recevoir les emails entrants via webhook
 * Niveau de sécurité : Gmail/Outlook
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let clientIp = 'unknown';
  
  // Log de débogage : requête reçue
  console.log('📧 [INBOUND EMAIL] Requête reçue à', new Date().toISOString());
  console.log('📧 [INBOUND EMAIL] Headers:', {
    'svix-id': request.headers.get('svix-id') ? 'présent' : 'absent',
    'svix-timestamp': request.headers.get('svix-timestamp') ? 'présent' : 'absent',
    'svix-signature': request.headers.get('svix-signature') ? 'présent' : 'absent',
    'x-mailgun-signature': request.headers.get('x-mailgun-signature') ? 'présent' : 'absent',
    'content-type': request.headers.get('content-type'),
  });
  
  try {
    // 1. Récupérer l'IP du client pour le rate limiting
    clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // 2. Rate Limiting
    const rateLimit = checkRateLimit(clientIp, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);
    if (!rateLimit.allowed) {
      console.warn(`Rate limit exceeded for IP: ${clientIp}`);
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt.toString(),
          }
        }
      );
    }

    // 3. Lire le body brut pour la vérification de signature
    const rawBody = await request.text();
    
    // 4. Vérifier la signature du webhook (SÉCURITÉ CRITIQUE)
    // Resend utilise Svix pour les signatures
    const svixId = request.headers.get('svix-id');
    const svixTimestamp = request.headers.get('svix-timestamp');
    const svixSignature = request.headers.get('svix-signature');
    
    // Mailgun utilise ses propres headers
    const mailgunSignature = request.headers.get('x-mailgun-signature');
    const timestamp = request.headers.get('x-mailgun-timestamp');
    const token = request.headers.get('x-mailgun-token');

    const webhookSecret = process.env.WEBHOOK_SECRET;
    const mailgunApiKey = process.env.MAILGUN_API_KEY;

    if (!webhookSecret && !mailgunApiKey) {
      console.error('Webhook secret not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Vérifier la signature selon le service
    let signatureValid = false;
    if (svixId && svixTimestamp && svixSignature && webhookSecret) {
      // Resend utilise Svix
      console.log('📧 [INBOUND EMAIL] Vérification signature Resend (Svix):', {
        svixId: svixId ? 'présent' : 'absent',
        svixTimestamp: svixTimestamp ? 'présent' : 'absent',
        svixSignature: svixSignature ? 'présent' : 'absent',
        secretPresent: !!webhookSecret,
        bodyLength: rawBody.length,
      });
      
      try {
        const wh = new Webhook(webhookSecret);
        const event = wh.verify(rawBody, {
          'svix-id': svixId,
          'svix-timestamp': svixTimestamp,
          'svix-signature': svixSignature,
        });
        signatureValid = true;
        console.log('📧 [INBOUND EMAIL] Signature Resend (Svix) vérifiée avec succès');
      } catch (error: any) {
        console.error('📧 [INBOUND EMAIL] Erreur vérification Svix:', error.message);
        signatureValid = false;
      }
    } else if (mailgunSignature && timestamp && token && mailgunApiKey) {
      signatureValid = verifyMailgunSignature(
        token,
        timestamp,
        mailgunSignature || '',
        mailgunApiKey || ''
      );
    } else {
      // En développement, permettre de bypasser (à retirer en production)
      if (process.env.NODE_ENV === 'development' && process.env.ALLOW_UNSIGNED_WEBHOOKS === 'true') {
        console.warn('⚠️  WARNING: Accepting unsigned webhook in development mode');
        signatureValid = true;
      } else {
        console.error('No valid signature found');
        return NextResponse.json(
          { error: 'Invalid or missing signature' },
          { status: 401 }
        );
      }
    }

    if (!signatureValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // 5. Parser le JSON
    let body: any;
    try {
      body = JSON.parse(rawBody);
      console.log('📧 [INBOUND EMAIL] Body parsé:', {
        type: body.type,
        hasData: !!body.data,
        keys: Object.keys(body),
        dataKeys: body.data ? Object.keys(body.data) : [],
        fullBody: JSON.stringify(body, null, 2).substring(0, 2000), // Log first 2000 chars
      });
      
      // Vérifier si c'est un webhook inbound (email.received) ou outbound (email.delivered, email.bounced, etc.)
      if (body.type !== 'email.received') {
        console.log(`⚠️ [INBOUND EMAIL] Webhook de type "${body.type}" ignoré (attendu: "email.received")`);
        return NextResponse.json(
          { message: `Webhook type "${body.type}" ignored. Only "email.received" is processed.` },
          { status: 200 }
        );
      }
    } catch (error) {
      console.error('📧 [INBOUND EMAIL] Erreur parsing JSON:', error);
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      );
    }

    // 6. Extraire les données de l'email
    let emailData = extractEmailData(body);
    console.log('📧 [INBOUND EMAIL] Données extraites:', {
      from: emailData?.fromEmail,
      to: emailData?.to,
      subject: emailData?.subject?.substring(0, 50),
      hasTextBody: !!emailData?.textBody,
      hasHtmlBody: !!emailData?.htmlBody,
      emailId: emailData?.emailId,
    });
    
    if (!emailData) {
      return NextResponse.json(
        { error: 'Invalid email data' },
        { status: 400 }
      );
    }

    // 6.5. Si le contenu est vide et qu'on a un email_id, récupérer le contenu via l'API Resend
    if ((!emailData.textBody && !emailData.htmlBody) && emailData.emailId && resend) {
      try {
        console.log('📧 [INBOUND EMAIL] Récupération du contenu via API Resend pour email_id:', emailData.emailId);
        const emailContentResponse = await resend.emails.get(emailData.emailId);
        
        if (emailContentResponse && !emailContentResponse.error && emailContentResponse.data) {
          console.log('✅ [INBOUND EMAIL] Contenu récupéré via API Resend');
          const emailContent = emailContentResponse.data;
          // Mettre à jour les données avec le contenu récupéré
          // Note: L'API Resend pour les emails entrants peut avoir une structure différente
          emailData.textBody = (emailContent as any).text || emailData.textBody || '';
          emailData.htmlBody = (emailContent as any).html || emailData.htmlBody || '';
          // Mettre à jour le preview
          emailData.preview = emailData.textBody.substring(0, 100) || emailData.htmlBody.replace(/<[^>]*>/g, '').substring(0, 100) || 'Pas de contenu';
        } else {
          console.warn('⚠️ [INBOUND EMAIL] Impossible de récupérer le contenu via API Resend:', emailContentResponse?.error);
        }
      } catch (error: any) {
        console.error('❌ [INBOUND EMAIL] Erreur lors de la récupération du contenu via API Resend:', error);
        // Continuer même si la récupération échoue
      }
    }

    // 7. Validation stricte des emails
    if (!isValidEmail(emailData.fromEmail)) {
      return NextResponse.json(
        { error: 'Invalid sender email' },
        { status: 400 }
      );
    }

    if (!isValidEmail(emailData.to)) {
      return NextResponse.json(
        { error: 'Invalid recipient email' },
        { status: 400 }
      );
    }

    // 8. Vérifier la taille de l'email
    const emailSize = new Blob([rawBody]).size;
    if (!validateEmailSize(emailSize, MAX_EMAIL_SIZE / (1024 * 1024))) {
      return NextResponse.json(
        { error: 'Email too large' },
        { status: 413 }
      );
    }

    // 9. Vérifier la blacklist
    const blacklist = process.env.EMAIL_BLACKLIST?.split(',') || [];
    if (isBlacklisted(emailData.fromEmail, blacklist)) {
      console.warn(`Blocked email from blacklisted sender: ${emailData.fromEmail}`);
      return NextResponse.json(
        { error: 'Sender blocked' },
        { status: 403 }
      );
    }

    // 10. Détection de spam
    const spamCheck = detectSpam({
      fromEmail: emailData.fromEmail,
      fromName: emailData.fromName,
      subject: emailData.subject,
      textBody: emailData.textBody,
      htmlBody: emailData.htmlBody,
    });

    // Si spam détecté, loguer mais ne pas bloquer (pour review manuelle)
    if (spamCheck.isSpam) {
      console.warn(`Potential spam detected from ${emailData.fromEmail}:`, spamCheck);
      // En production, vous pourriez vouloir bloquer ou mettre en quarantaine
      // Pour l'instant, on logue seulement
    }

    // 11. Sanitization des données (SÉCURITÉ NIVEAU 2 - Protection XSS)
    const sanitizedData = {
      fromEmail: emailData.fromEmail.toLowerCase().trim(),
      fromName: emailData.fromName ? sanitizeText(emailData.fromName).trim() : null,
      to: emailData.to.toLowerCase().trim(),
      subject: sanitizeSubject(emailData.subject),
      textBody: emailData.textBody ? sanitizeText(emailData.textBody) : null,
      // CRITIQUE : Utiliser sanitizeEmailHTML pour protéger contre XSS
      htmlBody: emailData.htmlBody ? sanitizeEmailHTML(emailData.htmlBody) : null,
      preview: extractPreview(emailData.textBody || emailData.htmlBody || '', 100),
    };

    // 12. Trouver l'utilisateur par son adresse email
    // IMPORTANT: Utiliser supabaseAdmin pour contourner RLS
    const clientToUse = supabaseAdmin || supabase;
    const { data: profile, error: profileError } = await clientToUse
      .from('profiles')
      .select('id, email, plan')
      .eq('email', sanitizedData.to)
      .single();
    
    if (profileError || !profile) {
      console.error('❌ [INBOUND EMAIL] User not found for email:', sanitizedData.to);
      console.error('❌ [INBOUND EMAIL] Profile error:', profileError);
      console.error('❌ [INBOUND EMAIL] Using admin client:', !!supabaseAdmin);
      
      // Vérifier si l'utilisateur existe dans auth.users (peut-être que le profil n'a pas été créé)
      if (supabaseAdmin) {
        const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        const userExists = authUsers?.users?.find((u: any) => u.email === sanitizedData.to);
        console.log('❌ [INBOUND EMAIL] User in auth.users:', userExists ? 'EXISTS' : 'NOT FOUND');
        if (userExists && !authError) {
          console.log('⚠️ [INBOUND EMAIL] User exists in auth.users but not in profiles table!');
        }
      }
      
      // Ne pas révéler que l'utilisateur n'existe pas (sécurité)
      // Mais on logue pour le débogage
      return NextResponse.json(
        { success: true, message: 'Email processed' },
        { status: 200 }
      );
    }

    console.log(`✅ [INBOUND EMAIL] User found: ${profile.email} (ID: ${profile.id})`);

    // 13. Vérifier si l'expéditeur est dans les contacts (pour Premium Shield)
    const { data: contact } = await supabase
      .from('contacts')
      .select('is_trusted')
      .eq('user_id', profile.id)
      .eq('email', sanitizedData.fromEmail)
      .single();
    
    const isTrusted = !!contact?.is_trusted;

    // 14. Vérifier si l'utilisateur a Premium Shield activé et si l'expéditeur a payé
    // TODO: Implémenter la logique de paiement du timbre ici
    const hasPaidStamp = !isTrusted && false; // À implémenter selon votre logique

    // 15. Stocker l'email dans Supabase
    // Utiliser le client admin (service role) pour contourner RLS, ou la fonction PostgreSQL
    let email: any;
    let emailError: any;

    if (supabaseAdmin) {
      // Méthode 1: Utiliser le service role key (recommandé)
      const { data, error } = await supabaseAdmin
        .from('emails')
        .insert({
          user_id: profile.id,
          from_email: sanitizedData.fromEmail,
          from_name: sanitizedData.fromName,
          subject: sanitizedData.subject,
          body: sanitizedData.textBody,
          body_html: sanitizedData.htmlBody,
          preview: sanitizedData.preview,
          received_at: new Date().toISOString(),
          has_paid_stamp: hasPaidStamp,
          archived: false,
          deleted: false,
          starred: false,
        })
        .select()
        .single();
      
      email = data;
      emailError = error;
      
      if (error) {
        console.error('❌ [INBOUND EMAIL] Error inserting email with service role:', error);
      } else {
        console.log(`✅ [INBOUND EMAIL] Email inserted successfully with ID: ${data?.id}`);
      }
    } else {
      // Méthode 2: Utiliser la fonction PostgreSQL (fallback)
      const { data, error } = await supabase.rpc('insert_email_via_webhook', {
        p_user_id: profile.id,
        p_from_email: sanitizedData.fromEmail,
        p_from_name: sanitizedData.fromName,
        p_subject: sanitizedData.subject,
        p_body: sanitizedData.textBody,
        p_body_html: sanitizedData.htmlBody,
        p_preview: sanitizedData.preview,
        p_has_paid_stamp: hasPaidStamp,
        p_archived: false,
        p_deleted: false,
        p_starred: false,
      });

      if (error) {
        emailError = error;
        console.error('❌ [INBOUND EMAIL] Error inserting email with PostgreSQL function:', error);
      } else {
        console.log(`✅ [INBOUND EMAIL] Email inserted via PostgreSQL function with ID: ${data}`);
        // Récupérer l'email créé
        const { data: emailData, error: fetchError } = await supabase
          .from('emails')
          .select('*')
          .eq('id', data)
          .single();
        
        email = emailData;
        emailError = fetchError;
        
        if (fetchError) {
          console.error('❌ [INBOUND EMAIL] Error fetching inserted email:', fetchError);
        }
      }
    }
    
    if (emailError) {
      console.error('❌ [INBOUND EMAIL] Error storing email:', emailError);
      return NextResponse.json(
        { error: 'Failed to store email', details: emailError.message },
        { status: 500 }
      );
    }

    // 16. Log de sécurité
    const processingTime = Date.now() - startTime;
    console.log(`✅ [INBOUND EMAIL] Email received and stored successfully:`, {
      emailId: email.id,
      userId: profile.id,
      userEmail: profile.email,
      from: sanitizedData.fromEmail,
      to: sanitizedData.to,
      subject: sanitizedData.subject.substring(0, 50),
      spamScore: spamCheck.score,
      processingTime: `${processingTime}ms`,
      ip: clientIp,
    });

    return NextResponse.json(
      { 
        success: true, 
        emailId: email.id,
        message: 'Email received and stored successfully',
        spamScore: spamCheck.score,
      },
      { 
        status: 200,
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetAt.toString(),
        }
      }
    );
    
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('Error processing inbound email:', {
      error: error.message,
      stack: error.stack,
      ip: clientIp,
      processingTime: `${processingTime}ms`,
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Extrait les données de l'email selon le format du service
 */
function extractEmailData(body: any) {
  // Format Resend Inbound
  if (body.type === 'email.received' || body.data) {
    const data = body.data || body;
    
    // Gérer le cas où 'to' est un tableau
    let toEmail = '';
    if (Array.isArray(data.to)) {
      toEmail = data.to[0] || '';
    } else {
      toEmail = data.to || data.envelope?.to?.[0] || data.recipient || '';
    }
    
    // Resend envoie le contenu dans des champs différents
    // Essayer tous les champs possibles pour trouver le contenu
    let textBody = data.text 
      || data['body-plain'] 
      || data['stripped-text']
      || data.body?.text 
      || data.body_text
      || data.content?.text
      || data.message?.text
      || '';
    
    let htmlBody = data.html 
      || data['body-html'] 
      || data['stripped-html']
      || data.body?.html 
      || data.body_html
      || data.content?.html
      || data.message?.html
      || '';
    
    // Si le contenu est toujours vide, essayer de le récupérer depuis les attachments ou autres champs
    // Resend peut aussi envoyer le contenu dans un format encodé
    if (!textBody && !htmlBody && data.content) {
      // Si content est une string, c'est peut-être le texte brut
      if (typeof data.content === 'string') {
        textBody = data.content;
      } else if (data.content.text) {
        textBody = data.content.text;
      } else if (data.content.html) {
        htmlBody = data.content.html;
      }
    }
    
    // Resend fournit email_id dans le webhook, on peut l'utiliser pour récupérer le contenu
    const emailId = data.email_id;
    
    console.log('📧 [EXTRACT] Contenu extrait:', {
      hasTextBody: !!textBody,
      hasHtmlBody: !!htmlBody,
      textBodyLength: textBody.length,
      htmlBodyLength: htmlBody.length,
      emailId: emailId,
      dataKeys: Object.keys(data),
    });
    
    return {
      fromEmail: data.from || data.from_email || data.envelope?.from || '',
      fromName: data.from_name || extractNameFromEmail(data.from),
      to: toEmail,
      subject: data.subject || '',
      textBody: textBody,
      htmlBody: htmlBody,
      emailId: emailId, // Store email_id to fetch content later if needed
      preview: textBody.substring(0, 100) || htmlBody.replace(/<[^>]*>/g, '').substring(0, 100) || 'Pas de contenu',
    };
  }
  
  // Format Mailgun
  if (body['sender'] || body['recipient']) {
    return {
      fromEmail: body.sender || body.from,
      fromName: extractNameFromEmail(body.sender || body.from),
      to: body.recipient || body.to,
      subject: body.subject || '',
      textBody: body['body-plain'] || body['stripped-text'] || '',
      htmlBody: body['body-html'] || body['stripped-html'] || '',
      preview: (body['body-plain'] || body['stripped-text'] || '').substring(0, 100),
    };
  }
  
  // Format générique
  return {
    fromEmail: body.from || body.from_email,
    fromName: body.from_name || extractNameFromEmail(body.from),
    to: body.to || body.recipient,
    subject: body.subject || '',
    textBody: body.text || body.body || body.textBody,
    htmlBody: body.html || body.htmlBody,
    preview: (body.text || body.body || '').substring(0, 100),
  };
}

/**
 * Extrait le nom depuis une adresse email formatée "Nom <email@domain.com>"
 */
function extractNameFromEmail(emailString?: string): string {
  if (!emailString) return '';
  
  const match = emailString.match(/^(.+?)\s*<(.+?)>$/);
  if (match) {
    return match[1].trim().replace(/['"]/g, '');
  }
  
  return '';
}

// GET pour vérifier que l'endpoint fonctionne (sans données sensibles)
export async function GET() {
  try {
    // Vérifier les variables d'environnement critiques
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasSupabaseAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const hasWebhookSecret = !!process.env.WEBHOOK_SECRET;
    
    return NextResponse.json(
      { 
        status: 'ok', 
        message: 'Inbound email endpoint is ready',
        timestamp: new Date().toISOString(),
        environment: {
          hasSupabaseUrl,
          hasSupabaseAnonKey,
          hasServiceRoleKey,
          hasWebhookSecret,
          nodeEnv: process.env.NODE_ENV || 'not set',
        },
        security: {
          rateLimitEnabled: true,
          signatureVerification: true,
          spamDetection: true,
          maxEmailSize: `${MAX_EMAIL_SIZE / (1024 * 1024)}MB`,
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Endpoint error',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
