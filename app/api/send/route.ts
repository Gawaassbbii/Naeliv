import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qmwcvaaviheclxgerdgq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;

// Client Supabase avec service role pour contourner RLS
const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Client Resend
const resend = resendApiKey ? new Resend(resendApiKey) : null;

/**
 * API pour envoyer des emails via Resend
 * POST /api/send
 * 
 * Body:
 * {
 *   to: string | string[],
 *   subject: string,
 *   text?: string,
 *   html?: string,
 *   inReplyTo?: string, // Message-ID de l'email auquel on répond
 *   references?: string // Message-IDs de la conversation
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier que Resend est configuré
    if (!resend) {
      console.error('❌ [SEND EMAIL] RESEND_API_KEY non configuré');
      return NextResponse.json(
        { error: 'Service email non configuré' },
        { status: 500 }
      );
    }

    if (!supabaseAdmin) {
      console.error('❌ [SEND EMAIL] SUPABASE_SERVICE_ROLE_KEY non configuré');
      return NextResponse.json(
        { error: 'Configuration serveur invalide' },
        { status: 500 }
      );
    }

    // 2. Récupérer le token d'authentification depuis les headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // 3. Vérifier l'utilisateur avec Supabase
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error('❌ [SEND EMAIL] Erreur d\'authentification:', authError);
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // 4. Récupérer le profil utilisateur (prénom, email)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('first_name, email')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('❌ [SEND EMAIL] Profil non trouvé:', profileError);
      return NextResponse.json(
        { error: 'Profil utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // 5. Parser le body de la requête
    const body = await request.json();
    const { to, subject, text, html, inReplyTo, references } = body;

    // 6. Validation
    if (!to || !subject) {
      return NextResponse.json(
        { error: 'Les champs "to" et "subject" sont requis' },
        { status: 400 }
      );
    }

    if (!text && !html) {
      return NextResponse.json(
        { error: 'Au moins un des champs "text" ou "html" est requis' },
        { status: 400 }
      );
    }

    // 7. Construire l'adresse "from" avec le format: "Prénom <email@naeliv.com>"
    const userEmail = user.email || profile.email || `${user.id}@naeliv.com`;
    const firstName = profile.first_name || userEmail.split('@')[0];
    const fromEmail = userEmail.endsWith('@naeliv.com') 
      ? userEmail 
      : `${userEmail.split('@')[0]}@naeliv.com`;
    
    const from = `${firstName} <${fromEmail}>`;

    // 8. Préparer les headers pour les réponses (fil de discussion)
    const headers: Record<string, string> = {};
    if (inReplyTo) {
      headers['In-Reply-To'] = inReplyTo;
    }
    if (references) {
      headers['References'] = references;
    } else if (inReplyTo) {
      // Si on a inReplyTo mais pas references, utiliser inReplyTo comme référence
      headers['References'] = inReplyTo;
    }

    // 9. Envoyer l'email via Resend
    console.log('📧 [SEND EMAIL] Envoi en cours:', {
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      hasText: !!text,
      hasHtml: !!html,
      inReplyTo: !!inReplyTo
    });

    const { data: emailData, error: sendError } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      text: text || undefined,
      html: html || undefined,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
    });

    if (sendError) {
      console.error('❌ [SEND EMAIL] Erreur Resend:', sendError);
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email', details: sendError },
        { status: 500 }
      );
    }

    console.log('✅ [SEND EMAIL] Email envoyé avec succès:', emailData);

    // 10. Sauvegarder l'email dans Supabase (dossier "sent")
    const emailRecord = {
      user_id: user.id,
      from_email: fromEmail, // Utiliser from_email au lieu de from
      from_name: firstName, // Ajouter le nom
      to_email: Array.isArray(to) ? to : [to], // Utiliser to_email (array)
      subject: subject,
      body: text || null, // Utiliser body au lieu de text
      body_html: html || null, // Utiliser body_html au lieu de html
      text_content: text || null, // Garder aussi text_content pour compatibilité
      html_content: html || null, // Garder aussi html_content pour compatibilité
      folder: 'sent',
      message_id: emailData?.id || `sent-${Date.now()}`,
      in_reply_to: inReplyTo || null,
      email_references: references || inReplyTo || null,
      created_at: new Date().toISOString(),
      received_at: new Date().toISOString(), // Utiliser received_at pour la date
    };

    const { error: insertError } = await supabaseAdmin
      .from('emails')
      .insert(emailRecord);

    if (insertError) {
      console.error('⚠️ [SEND EMAIL] Erreur lors de la sauvegarde dans Supabase:', insertError);
      console.error('⚠️ [SEND EMAIL] Détails de l\'erreur:', JSON.stringify(insertError, null, 2));
      console.error('⚠️ [SEND EMAIL] Email record:', JSON.stringify(emailRecord, null, 2));
      // On ne retourne pas d'erreur car l'email a été envoyé avec succès
      // Mais on log l'erreur pour le debugging
    } else {
      console.log('✅ [SEND EMAIL] Email sauvegardé dans Supabase (dossier sent)');
    }

    // 11. Retourner le succès
    return NextResponse.json({
      success: true,
      messageId: emailData?.id,
      emailId: emailRecord.message_id,
    });

  } catch (error: any) {
    console.error('❌ [SEND EMAIL] Erreur inattendue:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}

