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
    const { codeId } = body;

    if (!codeId) {
      return NextResponse.json(
        { error: 'ID du code requis' },
        { status: 400 }
      );
    }

    // 4. Récupérer le code avant suppression pour le log
    const { data: codeToDelete } = await supabaseAdmin
      .from('beta_codes')
      .select('code')
      .eq('id', codeId)
      .single();

    // 5. Supprimer le code
    const { error: deleteError } = await supabaseAdmin
      .from('beta_codes')
      .delete()
      .eq('id', codeId);

    if (deleteError) {
      console.error('❌ [BETA CODE] Erreur lors de la suppression:', deleteError);
      return NextResponse.json(
        { error: deleteError.message || 'Erreur lors de la suppression du code' },
        { status: 400 }
      );
    }

    console.log(`✅ [BETA CODE] Code ${codeToDelete?.code || codeId} supprimé avec succès par ${user.email}`);
    
    return NextResponse.json({
      success: true,
      message: 'Code supprimé avec succès'
    });
  } catch (error: any) {
    console.error('❌ [BETA CODE] Erreur:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

