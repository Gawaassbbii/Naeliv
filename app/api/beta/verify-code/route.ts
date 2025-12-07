import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Configuration serveur invalide' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code requis' },
        { status: 400 }
      );
    }

    // Vérifier si le code existe et est actif
    const { data: betaCode, error: fetchError } = await supabaseAdmin
      .from('beta_codes')
      .select('id, code, is_active, usage_count')
      .eq('code', code.trim().toUpperCase())
      .single();

    // Si le code n'existe pas (supprimé ou incorrect)
    if (fetchError || !betaCode) {
      return NextResponse.json(
        { 
          error: 'Malheureusement votre code d\'accès a été supprimé, contactez le support',
          code_status: 'deleted'
        },
        { status: 404 }
      );
    }

    // Vérifier si le code est actif
    if (!betaCode.is_active) {
      return NextResponse.json(
        { 
          error: 'Malheureusement votre code d\'accès a été désactivé, contactez le support',
          code_status: 'disabled'
        },
        { status: 403 }
      );
    }

    // Incrémenter usage_count
    const { error: updateError } = await supabaseAdmin
      .from('beta_codes')
      .update({ 
        usage_count: (betaCode.usage_count || 0) + 1 
      })
      .eq('id', betaCode.id);

    if (updateError) {
      console.error('Erreur lors de la mise à jour du compteur:', updateError);
      // Ne pas bloquer si l'incrémentation échoue
    }

    console.log(`✅ [BETA CODE] Code ${code} validé avec succès`);

    return NextResponse.json({ 
      success: true,
      message: 'Code valide'
    });

  } catch (error: any) {
    console.error('❌ [BETA CODE] Erreur:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

