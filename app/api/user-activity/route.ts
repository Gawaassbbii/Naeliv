import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

/**
 * POST /api/user-activity
 * Met à jour l'activité de l'utilisateur (appelé automatiquement depuis le frontend)
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

    // Récupérer l'IP et le user agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Mettre à jour ou créer l'activité utilisateur
    const { error: upsertError } = await supabaseAdmin
      .rpc('upsert_user_activity', {
        p_user_id: user.id,
        p_ip_address: ipAddress,
        p_user_agent: userAgent
      });

    if (upsertError) {
      // Si la fonction n'existe pas, essayer un insert/update direct
      if (upsertError.code === '42883') {
        const { error: directError } = await supabaseAdmin
          .from('user_activity')
          .upsert({
            user_id: user.id,
            last_seen_at: new Date().toISOString(),
            ip_address: ipAddress,
            user_agent: userAgent,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (directError) {
          console.error('❌ [USER ACTIVITY] Erreur upsert direct:', directError);
          // Si la table n'existe pas, retourner success mais avec un message
          if (directError.code === '42P01') {
            return NextResponse.json({
              success: false,
              note: 'Table user_activity non trouvée. Exécutez le script SQL create_user_activity_table.sql'
            });
          }
          return NextResponse.json(
            { error: 'Erreur lors de la mise à jour de l\'activité' },
            { status: 500 }
          );
        }
      } else {
        console.error('❌ [USER ACTIVITY] Erreur:', upsertError);
        return NextResponse.json(
          { error: 'Erreur lors de la mise à jour de l\'activité' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('❌ [USER ACTIVITY] Erreur:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

