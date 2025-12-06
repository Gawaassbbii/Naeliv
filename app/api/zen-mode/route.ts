import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qmwcvaaviheclxgerdgq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

/**
 * API pour gérer le Zen Mode
 * GET : Récupère l'état du Zen Mode
 * POST : Met à jour le Zen Mode et libère les emails si désactivation
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '', {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupérer les préférences Zen Mode
    const { data: profile, error } = await supabaseAdmin
      ?.from('profiles')
      .select('zen_mode_enabled, zen_windows')
      .eq('id', user.id)
      .single() || { data: null, error: null };

    if (error) {
      console.error('Erreur lors de la récupération du Zen Mode:', error);
      return NextResponse.json({ error: 'Failed to fetch zen mode' }, { status: 500 });
    }

    return NextResponse.json({
      enabled: profile?.zen_mode_enabled || false,
      windows: profile?.zen_windows || ['09:00', '17:00']
    });
  } catch (error: any) {
    console.error('Error in GET /api/zen-mode:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '', {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { enabled, windows } = body;

    if (enabled === undefined) {
      return NextResponse.json({ error: 'Missing enabled parameter' }, { status: 400 });
    }

    // Mettre à jour le profil
    const { error: updateError } = await supabaseAdmin
      ?.from('profiles')
      .update({
        zen_mode_enabled: enabled,
        ...(windows && { zen_windows: windows })
      })
      .eq('id', user.id) || { error: null };

    if (updateError) {
      console.error('Erreur lors de la mise à jour du Zen Mode:', updateError);
      return NextResponse.json({ error: 'Failed to update zen mode' }, { status: 500 });
    }

    // Si désactivation du Zen Mode : libérer tous les emails en attente
    if (enabled === false) {
      console.log(`🌙 [ZEN MODE] Désactivation détectée, libération des emails en attente pour user ${user.id}`);
      
      const { error: releaseError } = await supabaseAdmin
        ?.from('emails')
        .update({ visible_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .gt('visible_at', new Date().toISOString()) || { error: null };

      if (releaseError) {
        console.error('Erreur lors de la libération des emails:', releaseError);
        // Ne pas échouer la requête si la libération échoue, mais logger l'erreur
      } else {
        console.log(`✅ [ZEN MODE] Emails libérés avec succès`);
      }
    }

    return NextResponse.json({ success: true, enabled });
  } catch (error: any) {
    console.error('Error in POST /api/zen-mode:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

