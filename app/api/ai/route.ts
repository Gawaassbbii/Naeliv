import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Initialiser OpenAI
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Log au démarrage (seulement pour vérifier la configuration)
if (openai) {
  console.log('✅ [AI API] OpenAI configuré correctement');
} else {
  console.warn('⚠️ [AI API] OpenAI non configuré - OPENAI_API_KEY manquante');
}

// Client Supabase avec service role pour contourner RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    // Vérifier qu'OpenAI est configuré
    if (!openai) {
      console.error('❌ [AI API] OpenAI non configuré - OPENAI_API_KEY manquante ou invalide');
      return NextResponse.json(
        { error: 'OpenAI API non configurée. Veuillez vérifier OPENAI_API_KEY dans .env.local' },
        { status: 500 }
      );
    }

    // Récupérer le token d'authentification depuis le header Authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Vérifier l'utilisateur via Supabase
    const { data: { user }, error: authError } = await supabaseAdmin
      ?.auth.getUser(token) || { data: { user: null }, error: null };

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier le plan PRO
    const { data: profile, error: profileError } = await supabaseAdmin
      ?.from('profiles')
      .select('is_pro, plan')
      .eq('id', user.id)
      .single() || { data: null, error: null };

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profil non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur est PRO : is_pro === true OU plan === 'pro'
    const isPro = profile.is_pro === true || profile.plan === 'pro';
    
    if (!isPro) {
      return NextResponse.json(
        { error: 'Fonctionnalité réservée aux membres Naeliv PRO.' },
        { status: 403 }
      );
    }

    // Récupérer les données de la requête
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Type et données requis' },
        { status: 400 }
      );
    }

    let prompt = '';
    let systemPrompt = '';

    // Switcher de tâches
    switch (type) {
      case 'summary': {
        // TL;DR - Résumé d'email
        systemPrompt = 'Tu es un assistant exécutif efficace. Résume cet email en 3 points clés (bullet points). Sois bref et direct.';
        prompt = `Résume cet email en 3 points clés:\n\n${data.emailBody || data.text}`;
        break;
      }

      case 'draft': {
        // Ghostwriter - Rédaction de réponse
        const intention = data.intention || 'Répondre poliment';
        
        if (intention === 'Rendre PRO') {
          // Option spéciale : Améliorer le texte existant pour le rendre plus professionnel
          systemPrompt = 'Tu es un expert en rédaction professionnelle. Améliore ce texte pour le rendre plus professionnel : utilise un vocabulaire plus raffiné, une structure plus claire, un ton plus formel et poli. Garde le même sens et les mêmes idées, mais améliore le style. Ne change pas le sens du message.';
          const existingText = (data.existingText || '').trim();
          if (!existingText) {
            return NextResponse.json(
              { error: 'Aucun texte à améliorer. Écrivez d\'abord votre message.' },
              { status: 400 }
            );
          }
          prompt = `Améliore ce texte pour le rendre plus professionnel. Garde le même sens, mais améliore le style, le vocabulaire et la structure :\n\n${existingText}`;
        } else if (data.isProResponse || intention === 'Réponse PRO personnalisée') {
          // Réponse PRO personnalisée : Générer une réponse professionnelle à partir d'un texte collé
          systemPrompt = 'Tu es un expert en rédaction professionnelle. Analyse ce texte et rédige une réponse professionnelle et polie. Pour les questions qui demandent des informations personnalisées (comme des dates, nombres, noms, etc.), utilise des placeholders entre crochets comme [combien de jours ?], [date], [nom], etc. Réponds de manière professionnelle à toutes les questions posées.';
          const originalText = (data.originalEmail || '').trim();
          if (!originalText) {
            return NextResponse.json(
              { error: 'Aucun texte fourni pour générer la réponse.' },
              { status: 400 }
            );
          }
          prompt = `Analyse ce texte et rédige une réponse professionnelle. Pour les questions nécessitant des informations personnalisées, utilise des placeholders entre crochets [exemple de question] :\n\n${originalText}`;
        } else {
          // Rédaction normale
          systemPrompt = 'Tu es un assistant de rédaction professionnel. Rédige une réponse courte et professionnelle basée sur cette intention. Ne mets pas de placeholders [Nom], invente ou reste générique.';
          const originalEmail = data.originalEmail ? `Email original:\n${data.originalEmail}\n\n` : '';
          prompt = `${originalEmail}Intention: ${intention}\n\nRédige une réponse professionnelle:`;
        }
        break;
      }

      case 'fix': {
        // Coach - Correction grammaticale
        systemPrompt = 'Tu es un coach linguistique. Corrige les fautes de ce texte (Français, Anglais ou Allemand) et renvoie UNIQUEMENT le texte corrigé, sans explications, sans commentaires, sans messages d\'introduction. Juste le texte corrigé.';
        prompt = `Corrige ce texte et renvoie uniquement le texte corrigé:\n\n${data.text}`;
        break;
      }

      default:
        return NextResponse.json(
          { error: 'Type de tâche non reconnu' },
          { status: 400 }
        );
    }

    // Appel à OpenAI
    console.log(`🤖 [AI API] Génération ${type} pour utilisateur ${user.id}`);
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    let generatedText = completion.choices[0]?.message?.content || '';

    if (!generatedText) {
      console.error('❌ [AI API] Aucun texte généré');
      return NextResponse.json(
        { error: 'Erreur lors de la génération - réponse vide' },
        { status: 500 }
      );
    }

    // Pour le type 'fix', nettoyer le texte pour ne garder que la correction
    if (type === 'fix') {
      // Supprimer les phrases d'introduction courantes
      const introPatterns = [
        /^[^]*?(?:Le texte est en français|Le texte est en anglais|Le texte est en allemand|Cependant|Voici|Voilà)[^]*?\n\n?/i,
        /^[^]*?Correction\s*:\s*\n?\n?/i,
        /^[^]*?Texte corrigé\s*:\s*\n?\n?/i,
        /^[^]*?Voici le texte corrigé\s*:\s*\n?\n?/i,
      ];
      
      for (const pattern of introPatterns) {
        generatedText = generatedText.replace(pattern, '');
      }
      
      // Supprimer les explications entre parenthèses à la fin
      generatedText = generatedText.replace(/\s*\([^)]+\)\s*$/, '');
      
      // Supprimer les lignes vides en début et fin
      generatedText = generatedText.trim();
    }

    console.log(`✅ [AI API] Génération réussie (${generatedText.length} caractères)`);

    return NextResponse.json({
      text: generatedText,
      type: type
    });

  } catch (error: any) {
    console.error('❌ [AI API] Erreur:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

