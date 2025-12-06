import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ [SETUP RLS] Variables d\'environnement manquantes');
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
 * Configure les politiques RLS pour le bucket "avatars"
 * POST /api/storage/setup-avatars-rls
 * 
 * Cette route essaie d'exécuter le SQL directement via l'API Management de Supabase
 */
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin || !supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuration serveur invalide' },
        { status: 500 }
      );
    }

    // SQL pour créer les politiques RLS
    const rlsPoliciesSQL = `
-- 1. S'assurer que RLS est activé sur storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les politiques existantes si elles existent (pour éviter les erreurs)
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can read avatars" ON storage.objects;

-- 3. Politique pour permettre aux utilisateurs authentifiés d'uploader leurs propres avatars
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (string_to_array(name, '-'))[1] = (auth.uid())::text
);

-- 4. Politique pour permettre aux utilisateurs de mettre à jour leurs propres avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (string_to_array(name, '-'))[1] = (auth.uid())::text
)
WITH CHECK (
  bucket_id = 'avatars'
  AND (string_to_array(name, '-'))[1] = (auth.uid())::text
);

-- 5. Politique pour permettre aux utilisateurs de supprimer leurs propres avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (string_to_array(name, '-'))[1] = (auth.uid())::text
);

-- 6. Politique pour permettre la lecture publique des avatars
CREATE POLICY "Public can read avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');
`;

    // Utiliser le client Supabase admin pour appeler la fonction RPC
    // La fonction setup_avatars_rls_policies() doit être créée au préalable
    // Voir: executer dans sql/setup_avatars_rls_function.sql
    
    console.log('🔄 [SETUP RLS] Tentative d\'exécution via fonction RPC...');
    
    // Appeler la fonction SQL via RPC
    const { data, error } = await supabaseAdmin.rpc('setup_avatars_rls_policies');

    if (error) {
      console.log('⚠️ [SETUP RLS] La fonction RPC n\'existe pas, instructions manuelles...');
      console.log('❌ [SETUP RLS] Erreur:', error.message);
      
      // Si la fonction n'existe pas, donner les instructions
      return NextResponse.json(
        { 
          success: false,
          message: 'La fonction SQL nécessaire n\'existe pas encore',
          instructions: {
            step1: 'Créez d\'abord cette fonction SQL dans Supabase SQL Editor :',
            sqlFile: 'executer dans sql/setup_avatars_rls_function.sql',
            step2: 'Ensuite, réessayez d\'uploader votre photo',
            step3: 'Ou créez les politiques manuellement via Dashboard → Storage → Policies → avatars',
            guide: 'Voir docs/GUIDE_RLS_AVATARS_SIMPLE.md pour les instructions détaillées'
          },
          sqlScript: rlsPoliciesSQL
        },
        { status: 200 }
      );
    }

    console.log('✅ [SETUP RLS] Politiques RLS créées avec succès');

    return NextResponse.json(
      { 
        success: true,
        message: 'Politiques RLS créées avec succès ! Vous pouvez maintenant uploader votre photo.',
        data
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ [SETUP RLS] Erreur inattendue:', error);
    
    // Si l'erreur indique que la fonction n'existe pas, on donne des instructions
    if (error.message?.includes('function') || error.message?.includes('does not exist') || error.message?.includes('not found')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Fonction SQL manquante',
          message: 'Il faut d\'abord créer la fonction setup_avatars_rls_policies dans Supabase SQL Editor',
          instructions: {
            step1: 'Allez dans Supabase Dashboard → SQL Editor',
            step2: 'Ouvrez le fichier : executer dans sql/setup_avatars_rls_function.sql',
            step3: 'Copiez-collez tout le contenu dans l\'éditeur SQL et exécutez-le',
            step4: 'Ensuite, réessayez d\'uploader votre photo',
            alternative: 'Ou créez les politiques manuellement via Dashboard → Storage → Policies → avatars'
          },
          sqlScript: rlsPoliciesSQL
        },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Erreur serveur', 
        details: error.message,
        message: 'Les politiques RLS doivent être créées manuellement. Voir docs/GUIDE_RLS_AVATARS_SIMPLE.md',
        sqlScript: rlsPoliciesSQL
      },
      { status: 500 }
    );
  }
}

/**
 * Vérifie si les politiques RLS sont configurées
 * GET /api/storage/setup-avatars-rls
 */
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Configuration serveur invalide' },
        { status: 500 }
      );
    }

    // Vérifier si les politiques existent
    // Note: On ne peut pas vérifier directement via l'API, mais on peut tester l'upload
    return NextResponse.json(
      { 
        message: 'Utilisez POST pour obtenir les instructions de configuration',
        note: 'Les politiques RLS doivent être configurées via le Dashboard Supabase'
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

