import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

const ADMIN_EMAIL = 'gabi@naeliv.com';

/**
 * GET /api/admin/live-users
 * Récupère le nombre d'utilisateurs en ligne (admin uniquement)
 */
export async function GET(request: NextRequest) {
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

    // Récupérer les utilisateurs en ligne (activité dans les 5 dernières minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    // Vérifier si la table user_activity existe et récupérer les utilisateurs actifs
    const { data: activityData, error: activityError } = await supabaseAdmin
      .from('user_activity')
      .select('user_id, last_seen_at')
      .gte('last_seen_at', fiveMinutesAgo)
      .order('last_seen_at', { ascending: false });

    if (activityError) {
      // Si la table n'existe pas, retourner 0 avec un message
      if (activityError.code === '42P01') {
        return NextResponse.json({
          onlineUsers: 0,
          totalUsers: 0,
          error: 'Table user_activity non trouvée',
          note: 'Exécutez le script SQL create_user_activity_table.sql pour activer le suivi des utilisateurs en ligne'
        });
      }
      console.error('❌ [LIVE USERS] Erreur:', activityError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des utilisateurs en ligne' },
        { status: 500 }
      );
    }

    const onlineUserIds = activityData?.map(item => item.user_id) || [];
    const onlineUsers = onlineUserIds.length;

    // Récupérer les profils des utilisateurs en ligne
    let users: any[] = [];
    if (onlineUserIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('id, email, first_name, last_name, username')
        .in('id', onlineUserIds);

      if (!profilesError && profiles) {
        // Combiner les données d'activité avec les profils
        users = activityData?.map((activity: any) => {
          const profile = profiles.find((p: any) => p.id === activity.user_id);
          return {
            email: profile?.email || 'N/A',
            firstName: profile?.first_name || '',
            lastName: profile?.last_name || '',
            lastSeen: activity.last_seen_at
          };
        }) || [];
      }
    }

    // Récupérer le nombre total d'utilisateurs
    const { count: totalUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      onlineUsers,
      totalUsers: totalUsers || 0,
      users
    });

  } catch (error: any) {
    console.error('❌ [LIVE USERS] Erreur:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

