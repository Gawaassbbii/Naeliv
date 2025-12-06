import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qmwcvaaviheclxgerdgq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client Supabase avec service role pour contourner RLS
const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

/**
 * API pour récupérer un profil par email (contourne RLS)
 * GET /api/profiles/get-by-email?email=xxx@naeliv.com
 */
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Configuration serveur invalide' },
        { status: 500 }
      );
    }

    // Récupérer l'email depuis les query params
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Paramètre email requis' },
        { status: 400 }
      );
    }

    // Normaliser l'email
    const normalizedEmail = email.toLowerCase().trim();

    // Récupérer le profil
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('avatar_url, first_name, last_name, email, username')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (error) {
      console.error('❌ [GET PROFILE] Erreur Supabase:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération du profil', details: error.message },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { profile: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      profile: {
        avatar_url: profile.avatar_url || null,
        first_name: profile.first_name || null,
        last_name: profile.last_name || null,
        email: profile.email,
        username: profile.username || null,
      }
    });

  } catch (error: any) {
    console.error('❌ [GET PROFILE] Erreur inattendue:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}


