import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ [CREATE BUCKET] Variables d\'environnement manquantes');
}

const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

/**
 * Crée le bucket "avatars" s'il n'existe pas déjà
 * POST /api/storage/create-avatars-bucket
 */
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Configuration serveur invalide' },
        { status: 500 }
      );
    }

    // Vérifier si le bucket existe déjà
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error('❌ [CREATE BUCKET] Erreur lors de la liste des buckets:', listError);
      return NextResponse.json(
        { error: 'Erreur lors de la vérification des buckets', details: listError.message },
        { status: 500 }
      );
    }

    const avatarsBucket = buckets?.find(b => b.name === 'avatars');
    
    if (avatarsBucket) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Le bucket "avatars" existe déjà',
          bucket: avatarsBucket
        },
        { status: 200 }
      );
    }

    // Créer le bucket
    const { data: newBucket, error: createError } = await supabaseAdmin.storage.createBucket('avatars', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    });

    if (createError) {
      console.error('❌ [CREATE BUCKET] Erreur lors de la création:', createError);
      return NextResponse.json(
        { error: 'Erreur lors de la création du bucket', details: createError.message },
        { status: 500 }
      );
    }

    console.log('✅ [CREATE BUCKET] Bucket "avatars" créé avec succès');

    return NextResponse.json(
      { 
        success: true, 
        message: 'Bucket "avatars" créé avec succès',
        bucket: newBucket
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ [CREATE BUCKET] Erreur inattendue:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Vérifie si le bucket existe
 * GET /api/storage/create-avatars-bucket
 */
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Configuration serveur invalide' },
        { status: 500 }
      );
    }

    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      return NextResponse.json(
        { error: 'Erreur lors de la vérification', details: listError.message },
        { status: 500 }
      );
    }

    const avatarsBucket = buckets?.find(b => b.name === 'avatars');
    
    return NextResponse.json(
      { 
        exists: !!avatarsBucket,
        bucket: avatarsBucket || null
      },
      { status: 200 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}

