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
import OpenAI from 'openai';

// Initialiser OpenAI pour le Smart Sorter
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Log au démarrage (seulement pour vérifier la configuration)
if (openai) {
  console.log('✅ [INBOUND EMAIL] OpenAI configuré pour Smart Sorter');
} else {
  console.warn('⚠️ [INBOUND EMAIL] OpenAI non configuré - Smart Sorter désactivé');
}

// Configuration de sécurité
const MAX_EMAIL_SIZE = 25 * 1024 * 1024; // 25MB
const RATE_LIMIT_MAX = 100; // Max 100 emails par minute par IP
const RATE_LIMIT_WINDOW = 60000; // 1 minute

// Alias système qui doivent être redirigés vers l'admin
const SYSTEM_ALIASES = [
  // Technique & Sécurité
  'abuse', 'postmaster', 'webmaster', 'hostmaster', 'security', 'noc', 'admin', 'administrator',
  // Support & Business
  'support', 'help', 'contact', 'info', 'hello', 'team',
  // Facturation & Légal
  'billing', 'invoice', 'sales', 'legal', 'privacy', 'compliance',
  // Com & RH
  'press', 'media', 'jobs', 'careers',
  // Bots
  'noreply', 'no-reply', 'notifications', 'alert', 'welcome'
];

const SUPER_ADMIN_EMAIL = 'gabi@naeliv.com';

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
    // Note: Le webhook email.received de Resend ne contient PAS le contenu, seulement les métadonnées
    // Il faut utiliser resend.emails.receiving.get() pour récupérer le contenu des emails entrants
    if ((!emailData.textBody && !emailData.htmlBody) && emailData.emailId && resend) {
      try {
        console.log('📧 [INBOUND EMAIL] Récupération du contenu via API Resend receiving.get() pour email_id:', emailData.emailId);
        const emailContentResponse = await resend.emails.receiving.get(emailData.emailId);
        
        if (emailContentResponse && !emailContentResponse.error && emailContentResponse.data) {
          console.log('✅ [INBOUND EMAIL] Contenu récupéré via API Resend');
          const emailContent = emailContentResponse.data;
          // Mettre à jour les données avec le contenu récupéré
          emailData.textBody = emailContent.text || emailData.textBody || '';
          emailData.htmlBody = emailContent.html || emailData.htmlBody || '';
          // Mettre à jour le preview
          emailData.preview = emailData.textBody.substring(0, 100) || emailContent.html?.replace(/<[^>]*>/g, '').substring(0, 100) || 'Pas de contenu';
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

    console.log(`📧 [INBOUND EMAIL] ⚠️⚠️⚠️ APRÈS SANITIZATION ⚠️⚠️⚠️`);
    console.log(`📧 [INBOUND EMAIL] sanitizedData.to: ${sanitizedData.to}`);

    // 12. Trouver l'utilisateur par son adresse email
    // IMPORTANT: Utiliser supabaseAdmin pour contourner RLS
    const clientToUse = supabaseAdmin || supabase;
    
    // Extraire le username du destinataire (partie avant le @)
    const recipientEmail = sanitizedData.to.toLowerCase().trim();
    const recipientUsername = recipientEmail.split('@')[0];
    const recipientDomain = recipientEmail.split('@')[1];
    
    console.log(`📧 [INBOUND EMAIL] ============================================`);
    console.log(`📧 [INBOUND EMAIL] Analyse du destinataire:`);
    console.log(`📧 [INBOUND EMAIL]   - Email destinataire: ${recipientEmail}`);
    console.log(`📧 [INBOUND EMAIL]   - Username: ${recipientUsername}`);
    console.log(`📧 [INBOUND EMAIL]   - Domaine: ${recipientDomain}`);
    console.log(`📧 [INBOUND EMAIL]   - SYSTEM_ALIASES contient 'support': ${SYSTEM_ALIASES.includes('support')}`);
    console.log(`📧 [INBOUND EMAIL]   - Username en minuscules: ${recipientUsername.toLowerCase()}`);
    console.log(`📧 [INBOUND EMAIL]   - Est dans SYSTEM_ALIASES: ${SYSTEM_ALIASES.includes(recipientUsername.toLowerCase())}`);
    console.log(`📧 [INBOUND EMAIL]   - SUPER_ADMIN_EMAIL: ${SUPER_ADMIN_EMAIL}`);
    
    // Vérifier si c'est un alias système
    const isSystemAlias = SYSTEM_ALIASES.includes(recipientUsername.toLowerCase());
    let targetEmail = sanitizedData.to.toLowerCase().trim();
    let modifiedSubject = sanitizedData.subject;
    
    console.log(`📧 [INBOUND EMAIL]   - isSystemAlias: ${isSystemAlias}`);
    console.log(`📧 [INBOUND EMAIL]   - recipientDomain === 'naeliv.com': ${recipientDomain === 'naeliv.com'}`);
    
    // Si c'est un alias système, rediriger vers l'admin
    if (isSystemAlias && recipientDomain === 'naeliv.com') {
      console.log(`📧 [INBOUND EMAIL] ✅✅✅ ALIAS SYSTÈME DÉTECTÉ ✅✅✅`);
      console.log(`📧 [INBOUND EMAIL] Redirection: ${recipientEmail} -> ${SUPER_ADMIN_EMAIL}`);
      
      // Modifier le sujet pour ajouter un tag
      const aliasTag = recipientUsername.toUpperCase();
      modifiedSubject = `[${aliasTag}] ${sanitizedData.subject}`;
      targetEmail = SUPER_ADMIN_EMAIL.toLowerCase().trim();
      
      console.log(`📧 [INBOUND EMAIL] Sujet modifié: "${modifiedSubject}"`);
      console.log(`📧 [INBOUND EMAIL] Email cible final: ${targetEmail}`);
    } else {
      console.log(`📧 [INBOUND EMAIL] ℹ️  Email normal (non alias système): ${recipientEmail}`);
      if (!isSystemAlias) {
        console.log(`📧 [INBOUND EMAIL]   Raison: Username "${recipientUsername}" n'est pas dans SYSTEM_ALIASES`);
      }
      if (recipientDomain !== 'naeliv.com') {
        console.log(`📧 [INBOUND EMAIL]   Raison: Domaine "${recipientDomain}" n'est pas "naeliv.com"`);
      }
    }
    console.log(`📧 [INBOUND EMAIL] ============================================`);
    
    // Chercher l'utilisateur cible
    console.log(`🔍 [INBOUND EMAIL] Recherche du profil pour: ${targetEmail}`);
    let profile: any = null;
    let profileError: any = null;
    
    const { data: profileData, error: profileErr } = await clientToUse
      .from('profiles')
      .select('id, email, plan, is_pro')
      .eq('email', targetEmail)
      .single();
    
    profile = profileData;
    profileError = profileErr;
    
    if (profileError || !profile) {
      console.error('❌ [INBOUND EMAIL] ============================================');
      console.error('❌ [INBOUND EMAIL] PROBLÈME: Profil non trouvé');
      console.error('❌ [INBOUND EMAIL] Email recherché:', targetEmail);
      console.error('❌ [INBOUND EMAIL] Email original (destinataire):', sanitizedData.to);
      console.error('❌ [INBOUND EMAIL] Est alias système:', isSystemAlias);
      console.error('❌ [INBOUND EMAIL] Erreur profil:', profileError);
      console.error('❌ [INBOUND EMAIL] Utilisation client admin:', !!supabaseAdmin);
      
      // Vérifier si l'utilisateur existe dans auth.users (peut-être que le profil n'a pas été créé)
      if (supabaseAdmin) {
        try {
        const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
          const userExists = authUsers?.users?.find((u: any) => u.email?.toLowerCase() === targetEmail.toLowerCase());
          console.error('❌ [INBOUND EMAIL] Utilisateur dans auth.users:', userExists ? 'EXISTE ✅' : 'NON TROUVÉ ❌');
          
        if (userExists && !authError) {
            console.error('⚠️ [INBOUND EMAIL] ⚠️  ATTENTION: L\'utilisateur existe dans auth.users mais PAS dans profiles!');
            console.error('⚠️ [INBOUND EMAIL] ID utilisateur:', userExists.id);
            console.error('⚠️ [INBOUND EMAIL] Email utilisateur:', userExists.email);
            
            // Essayer de créer le profil manquant
            try {
              const username = targetEmail.split('@')[0];
              const { data: newProfile, error: createError } = await supabaseAdmin
                .from('profiles')
                .insert({
                  id: userExists.id,
                  email: targetEmail,
                  username: username,
                  plan: 'pro', // Par défaut pour gabi@naeliv.com
                  is_pro: true, // Également marquer comme PRO
                })
                .select()
                .single();
              
              if (!createError && newProfile) {
                console.log('✅ [INBOUND EMAIL] Profil créé automatiquement pour:', targetEmail);
                // Utiliser le profil créé
                profile = newProfile;
                profileError = null;
                console.log('✅ [INBOUND EMAIL] Profil trouvé après création automatique');
              } else {
                console.error('❌ [INBOUND EMAIL] Erreur lors de la création du profil:', createError);
              }
            } catch (createErr: any) {
              console.error('❌ [INBOUND EMAIL] Exception lors de la création du profil:', createErr);
            }
          } else if (!userExists) {
            console.error('❌ [INBOUND EMAIL] L\'utilisateur n\'existe même pas dans auth.users!');
        }
        } catch (authErr: any) {
          console.error('❌ [INBOUND EMAIL] Erreur lors de la vérification auth.users:', authErr);
        }
      }
      
      // Si le profil n'a toujours pas été trouvé ou créé, retourner une erreur
      if (!profile) {
        console.error('❌ [INBOUND EMAIL] ============================================');
      // Ne pas révéler que l'utilisateur n'existe pas (sécurité)
      // Mais on logue pour le débogage
      return NextResponse.json(
        { success: true, message: 'Email processed' },
        { status: 200 }
      );
    }
    }

    console.log(`✅ [INBOUND EMAIL] User found: ${profile.email} (ID: ${profile.id})${isSystemAlias ? ' (via alias système)' : ''}`);

    // 12.5. Vérification du pare-feu (blocked_domains et whitelisted_senders)
    // Récupérer les paramètres du pare-feu depuis le profil (utiliser admin pour contourner RLS)
    const { data: firewallProfile, error: firewallError } = await (supabaseAdmin || clientToUse)
      .from('profiles')
      .select('blocked_domains, whitelisted_senders')
      .eq('id', profile.id)
      .single();

    if (firewallError) {
      console.error('❌ [FIREWALL] Erreur lors de la récupération des paramètres:', firewallError);
    }

    if (!firewallError && firewallProfile) {
      const blockedDomains = firewallProfile.blocked_domains || [];
      const whitelistedSenders = firewallProfile.whitelisted_senders || [];
      
      // Extraire l'email proprement (gérer le format "Nom <email@domain.com>")
      let senderEmailRaw = sanitizedData.fromEmail.trim();
      // Extraire l'email si format "Nom <email@domain.com>"
      const emailMatch = senderEmailRaw.match(/<(.+?)>/);
      if (emailMatch) {
        senderEmailRaw = emailMatch[1];
      }
      const senderEmail = senderEmailRaw.toLowerCase().trim();
      
      // Extraire le domaine de l'expéditeur
      const senderDomain = senderEmail.split('@')[1]?.toLowerCase().trim() || '';

      console.log(`🔍 [FIREWALL] Vérification pare-feu:`, {
        senderEmail,
        senderDomain,
        blockedDomainsCount: blockedDomains.length,
        whitelistedSendersCount: whitelistedSenders.length,
        blockedDomains: blockedDomains,
      });

      // Algorithme de filtrage du pare-feu
      // 1. Vérifier si l'expéditeur est dans whitelisted_senders -> ACCEPTER (même si domaine bloqué)
      if (whitelistedSenders.length > 0 && whitelistedSenders.includes(senderEmail)) {
        console.log(`✅ [FIREWALL] Email autorisé via exception: ${senderEmail}`);
        // Continuer le traitement normal
      }
      // 2. Vérifier si le domaine est dans blocked_domains -> REJETER
      else if (blockedDomains.length > 0 && senderDomain && blockedDomains.includes(senderDomain)) {
        console.log(`🚫 [FIREWALL] Email bloqué - domaine bloqué: ${senderDomain} (expéditeur: ${senderEmail})`);
        // Suppression silencieuse - retourner 200 pour ne pas révéler le blocage
        return NextResponse.json(
          { success: true, message: 'Email processed' },
          { status: 200 }
        );
      }
      // 3. Sinon -> ACCEPTER (continuer le traitement normal)
      else {
        console.log(`✅ [FIREWALL] Email autorisé: ${senderEmail} (domaine: ${senderDomain})`);
      }
    } else {
      console.log(`⚠️ [FIREWALL] Pas de paramètres de pare-feu trouvés ou erreur, email autorisé par défaut`);
    }

    // 13. Smart Paywall - Vérifier si l'expéditeur est autorisé
    // Récupérer les paramètres du Smart Paywall
    const { data: paywallProfile, error: paywallError } = await (supabaseAdmin || clientToUse)
      .from('profiles')
      .select('paywall_enabled, paywall_price, whitelisted_senders')
      .eq('id', profile.id)
      .single();

    const paywallEnabled = paywallProfile?.paywall_enabled === true;
    const paywallPrice = paywallProfile?.paywall_price || 10; // Par défaut 0,10€
    const whitelistedSenders = paywallProfile?.whitelisted_senders || [];

    // Extraire l'email de l'expéditeur
    let senderEmailRaw = sanitizedData.fromEmail.trim();
    const emailMatch = senderEmailRaw.match(/<(.+?)>/);
    if (emailMatch) {
      senderEmailRaw = emailMatch[1];
    }
    const senderEmail = senderEmailRaw.toLowerCase().trim();

    // Vérifier si l'expéditeur est dans les contacts de confiance
    const { data: contact } = await supabase
      .from('contacts')
      .select('is_trusted')
      .eq('user_id', profile.id)
      .eq('email', senderEmail)
      .single();
    
    const isTrusted = !!contact?.is_trusted;
    const isWhitelisted = whitelistedSenders.includes(senderEmail);
    const isAuthorized = isTrusted || isWhitelisted;

    // 14. Appliquer le Smart Paywall si activé
    let emailStatus = 'inbox'; // Par défaut : email autorisé
    let hasPaidStamp = false;
    let paymentUrl: string | null = null;

    if (paywallEnabled && !isAuthorized) {
      // L'expéditeur est un inconnu, le mettre en quarantaine
      emailStatus = 'quarantine';
      console.log(`🔒 [SMART PAYWALL] Email mis en quarantaine - Expéditeur inconnu: ${senderEmail}`);
      
      // Note: Le paiement sera géré après l'insertion de l'email pour avoir l'ID
      // On marquera hasPaidStamp = false pour l'instant
    } else {
      // Email autorisé (contact de confiance ou paywall désactivé)
      hasPaidStamp = isAuthorized;
    }

    // 14.5. Smart Sorter - Catégorisation IA pour les membres PRO
    let emailCategory: string | null = null;
    // Vérifier si l'utilisateur est PRO : is_pro === true OU plan === 'pro'
    const isPro = profile.is_pro === true || profile.plan === 'pro';
    
    if (isPro && (sanitizedData.textBody || sanitizedData.htmlBody)) {
      if (!openai) {
        console.warn('⚠️ [INBOUND EMAIL] OpenAI non configuré - Smart Sorter désactivé');
      } else {
        try {
          const emailContent = (sanitizedData.textBody || sanitizedData.htmlBody?.replace(/<[^>]*>/g, '') || '').substring(0, 1000);
          
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              { 
                role: 'system', 
                content: 'Catégorise cet email en un seul mot : "Finance", "Updates", "Personal", "Spam", ou "Work". Réponds uniquement avec le mot, rien d\'autre.' 
              },
              { 
                role: 'user', 
                content: `Sujet: ${modifiedSubject}\n\nContenu: ${emailContent}` 
              }
            ],
            temperature: 0.3,
            max_tokens: 10,
          });

          const category = completion.choices[0]?.message?.content?.trim();
          if (category && ['Finance', 'Updates', 'Personal', 'Spam', 'Work'].includes(category)) {
            emailCategory = category;
            console.log(`✨ [INBOUND EMAIL] Email catégorisé: ${emailCategory}`);
          } else {
            console.warn(`⚠️ [INBOUND EMAIL] Catégorie invalide reçue: ${category}`);
          }
        } catch (error: any) {
          console.error('❌ [INBOUND EMAIL] Erreur lors de la catégorisation IA:', error);
          // Continuer même si la catégorisation échoue
        }
      }
    }

    // 14.6. Zen Mode - Calculer visible_at selon les préférences de l'utilisateur
    let visibleAt = new Date(); // Par défaut : visible immédiatement
    
    // Récupérer les préférences Zen Mode du profil
    const zenModeEnabled = profile.zen_mode_enabled === true;
    const zenWindows = profile.zen_windows || ['09:00', '17:00'];
    
    if (zenModeEnabled && Array.isArray(zenWindows) && zenWindows.length > 0) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute; // Minutes depuis minuit
      
      // Convertir les fenêtres en minutes depuis minuit
      const windowTimes = zenWindows.map(window => {
        const [hours, minutes] = window.split(':').map(Number);
        return hours * 60 + minutes;
      }).sort((a, b) => a - b); // Trier par ordre chronologique
      
      // Trouver la prochaine fenêtre
      let nextWindow = windowTimes.find(time => time > currentTime);
      
      if (nextWindow === undefined) {
        // Pas de fenêtre aujourd'hui, prendre la première de demain
        nextWindow = windowTimes[0];
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(Math.floor(nextWindow / 60), nextWindow % 60, 0, 0);
        visibleAt = tomorrow;
      } else {
        // Fenêtre aujourd'hui
        const today = new Date(now);
        today.setHours(Math.floor(nextWindow / 60), nextWindow % 60, 0, 0);
        visibleAt = today;
      }
      
      console.log(`🌙 [ZEN MODE] Email programmé pour: ${visibleAt.toISOString()} (fenêtre: ${zenWindows[windowTimes.indexOf(nextWindow)] || zenWindows[0]})`);
    } else {
      console.log(`✅ [ZEN MODE] Zen Mode désactivé, email visible immédiatement`);
    }

    // 14.5. Récupérer l'avatar de l'expéditeur si c'est un utilisateur @naeliv.com
    let senderAvatarUrl: string | null = null;
    const senderEmailForAvatar = sanitizedData.fromEmail.toLowerCase().trim();
    if (senderEmailForAvatar.endsWith('@naeliv.com')) {
      try {
        const { data: senderProfile } = await (supabaseAdmin || clientToUse)
          .from('profiles')
          .select('avatar_url')
          .eq('email', senderEmailForAvatar)
          .single();
        
        if (senderProfile?.avatar_url) {
          senderAvatarUrl = senderProfile.avatar_url;
          console.log(`✅ [INBOUND EMAIL] Avatar trouvé pour expéditeur ${senderEmailForAvatar}`);
        }
      } catch (avatarError: any) {
        // Erreur silencieuse - ce n'est pas critique si l'avatar n'est pas trouvé
        console.log(`ℹ️ [INBOUND EMAIL] Avatar non trouvé pour ${senderEmailForAvatar} (normal si utilisateur externe)`);
      }
    }

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
          from_avatar_url: senderAvatarUrl, // Ajouter l'avatar de l'expéditeur
          subject: modifiedSubject, // Utiliser le sujet modifié (avec tag si alias système)
          body: sanitizedData.textBody,
          body_html: sanitizedData.htmlBody,
          preview: sanitizedData.preview,
          received_at: new Date().toISOString(),
          visible_at: visibleAt.toISOString(), // Date de visibilité selon Zen Mode
          status: emailStatus, // Status selon Smart Paywall ('inbox' ou 'quarantine')
          has_paid_stamp: hasPaidStamp,
          archived: false,
          deleted: false,
          starred: false, // Ne pas marquer automatiquement comme favori
          ...(emailCategory && { category: emailCategory }), // Ajouter la catégorie IA si disponible
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
      // Méthode 2: Fallback - Utiliser la fonction PostgreSQL (supabaseAdmin n'est pas disponible)
      // Note: visible_at sera défini par défaut à NOW() par la base de données
      const { data, error } = await supabase.rpc('insert_email_via_webhook', {
        p_user_id: profile.id,
        p_from_email: sanitizedData.fromEmail,
        p_from_name: sanitizedData.fromName,
        p_subject: modifiedSubject,
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
        } else if (email) {
          // Mettre à jour visible_at via le client normal (si possible)
          // Note: Cela nécessite des permissions RLS appropriées
          console.log('⚠️ [ZEN MODE] visible_at sera défini à NOW() par défaut (fonction RPC)');
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

    // 15.5. Smart Paywall - Créer session Stripe et envoyer email si en quarantine
    if (emailStatus === 'quarantine' && email?.id) {
      try {
        // Créer une session Stripe Checkout pour le paiement
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        if (stripeKey) {
          const Stripe = (await import('stripe')).default;
          const stripe = new Stripe(stripeKey, {
            apiVersion: '2025-11-17.clover',
          });

          const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
              {
                price_data: {
                  currency: 'eur',
                  product_data: {
                    name: 'Timbre de sécurité Naeliv',
                    description: `Paiement pour délivrer votre email à ${profile.email}`,
                  },
                  unit_amount: paywallPrice,
                },
                quantity: 1,
              },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://naeliv.com'}/paywall-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://naeliv.com'}/paywall-cancel`,
            metadata: {
              email_id: email.id,
              recipient_user_id: profile.id,
              sender_email: senderEmail,
              productType: 'paywall_stamp',
            },
          });

          paymentUrl = session.url;
          console.log(`🔒 [SMART PAYWALL] Session Stripe créée pour email ${email.id}: ${session.id}`);

          // Envoyer un email automatique à l'expéditeur
          if (resend) {
            const stampPriceEur = (paywallPrice / 100).toFixed(2);
            await resend.emails.send({
              from: 'Naeliv <noreply@naeliv.com>',
              to: senderEmail,
              subject: `Action requise : Votre email à ${profile.email} est en attente`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Bonjour,</h2>
                  <p>${profile.email} utilise <strong>Naeliv</strong>, un service de messagerie qui protège contre le spam.</p>
                  <p>Pour délivrer votre message, veuillez régler le timbre de sécurité de <strong>${stampPriceEur}€</strong> via ce lien sécurisé :</p>
                  <p style="text-align: center; margin: 30px 0;">
                    <a href="${paymentUrl}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      Payer le timbre de sécurité
                    </a>
                  </p>
                  <p><strong>Une fois payé, vous serez ajouté à la liste verte</strong> et n'aurez plus besoin de payer pour vos prochains messages.</p>
                  <p>Cordialement,<br>L'équipe Naeliv</p>
                </div>
              `,
              text: `Bonjour,\n\n${profile.email} utilise Naeliv, un service de messagerie qui protège contre le spam.\n\nPour délivrer votre message, veuillez régler le timbre de sécurité de ${stampPriceEur}€ via ce lien sécurisé :\n\n${paymentUrl}\n\nUne fois payé, vous serez ajouté à la liste verte et n'aurez plus besoin de payer pour vos prochains messages.\n\nCordialement,\nL'équipe Naeliv`,
            });
            console.log(`📧 [SMART PAYWALL] Email automatique envoyé à ${senderEmail}`);
          }
        } else {
          console.warn('⚠️ [SMART PAYWALL] STRIPE_SECRET_KEY non configuré, impossible de créer la session de paiement');
        }
      } catch (paywallError: any) {
        console.error('❌ [SMART PAYWALL] Erreur lors de la création de la session ou envoi de l\'email:', paywallError);
        // Ne pas faire échouer l'insertion de l'email, juste logger l'erreur
      }
    }

    // 16. Log de sécurité
    const processingTime = Date.now() - startTime;
    console.log(`✅ [INBOUND EMAIL] Email received and stored successfully:`, {
      emailId: email.id,
      userId: profile.id,
      userEmail: profile.email,
      from: sanitizedData.fromEmail,
      to: sanitizedData.to,
      targetEmail: targetEmail,
      isSystemAlias: isSystemAlias,
      subject: modifiedSubject.substring(0, 50),
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
