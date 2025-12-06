import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

const ADMIN_EMAIL = 'gabi@naeliv.com';

/**
 * GET /api/maintenance
 * Récupère le statut de maintenance
 */
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Configuration serveur invalide' },
        { status: 500 }
      );
    }

    // Vérifier dans la table app_settings ou créer si elle n'existe pas
    const { data: settings, error } = await supabaseAdmin
      .from('app_settings')
      .select('*')
      .eq('key', 'maintenance_mode')
      .single();

    if (error && error.code !== 'PGRST116') {
      // Si la table n'existe pas, on retourne false par défaut
      if (error.code === '42P01') {
        return NextResponse.json({ enabled: false });
      }
      console.error('❌ [MAINTENANCE] Erreur:', error);
      return NextResponse.json({ enabled: false });
    }

    // Si aucune entrée, maintenance désactivée
    if (!settings) {
      return NextResponse.json({ enabled: false });
    }

    return NextResponse.json({ 
      enabled: settings.value === 'true' || settings.value === true 
    });

  } catch (error: any) {
    console.error('❌ [MAINTENANCE] Erreur:', error);
    return NextResponse.json({ enabled: false });
  }
}

/**
 * POST /api/maintenance
 * Active/désactive la maintenance (admin uniquement)
 */
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Configuration serveur invalide' },
        { status: 500 }
      );
    }

    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Vérifier l'utilisateur
    const { data: { user }, error: authError } = await supabaseAdmin
      .auth.getUser(token) || { data: { user: null }, error: null };

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier que c'est l'admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    if (!profile || profile.email !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Accès refusé. Admin uniquement.' },
        { status: 403 }
      );
    }

    // Récupérer le statut demandé
    const body = await request.json();
    const enabled = body.enabled === true || body.enabled === 'true';

    // Créer la table app_settings si elle n'existe pas (via SQL)
    // Pour l'instant, on va juste essayer d'insérer/mettre à jour
    const { data, error } = await supabaseAdmin
      .from('app_settings')
      .upsert({
        key: 'maintenance_mode',
        value: enabled.toString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [MAINTENANCE] Erreur upsert:', error);
      
      // Si la table n'existe pas, on retourne une instruction
      if (error.code === '42P01') {
        return NextResponse.json({
          error: 'Table app_settings non trouvée',
          instructions: 'Exécutez le script SQL pour créer la table app_settings'
        }, { status: 500 });
      }

      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      );
    }

    console.log(`✅ [MAINTENANCE] Mode maintenance ${enabled ? 'activé' : 'désactivé'} par ${ADMIN_EMAIL}`);

    return NextResponse.json({ 
      success: true,
      enabled,
      message: `Maintenance ${enabled ? 'activée' : 'désactivée'}`
    });

  } catch (error: any) {
    console.error('❌ [MAINTENANCE] Erreur:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

