import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client avec service role key (contourne RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const ADMIN_EMAIL = 'gabi@naeliv.com';

export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Vérifier le token avec Supabase
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // 2. Vérifier que l'utilisateur est admin
    if (user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json(
        { error: 'Accès refusé. Admin uniquement.' },
        { status: 403 }
      );
    }

    // 3. Récupérer les données de la requête
    const body = await request.json();
    const { codeId, currentStatus } = body;

    if (!codeId || typeof currentStatus !== 'boolean') {
      return NextResponse.json(
        { error: 'Paramètres invalides' },
        { status: 400 }
      );
    }

    // 4. Mettre à jour le statut du code
    const { data: updatedCode, error: updateError } = await supabaseAdmin
      .from('beta_codes')
      .update({ is_active: !currentStatus })
      .eq('id', codeId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ [BETA CODE] Erreur lors de la mise à jour:', updateError);
      return NextResponse.json(
        { error: updateError.message || 'Erreur lors de la mise à jour du code' },
        { status: 400 }
      );
    }

    console.log(`✅ [BETA CODE] Code ${updatedCode.code} ${!currentStatus ? 'activé' : 'désactivé'} avec succès par ${user.email}`);
    
    return NextResponse.json({
      success: true,
      code: updatedCode
    });
  } catch (error: any) {
    console.error('❌ [BETA CODE] Erreur:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

