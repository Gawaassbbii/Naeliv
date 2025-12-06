-- ============================================================================
-- FIX: Politiques RLS pour le bucket "avatars"
-- ============================================================================
-- ⚠️ ATTENTION : Ce script nécessite des permissions d'administrateur de base de données
-- Si vous obtenez l'erreur "must be owner of table objects", utilisez plutôt
-- l'interface Dashboard : voir docs/GUIDE_CONFIGURER_RLS_AVATARS.md
--
-- Ce script corrige les politiques RLS pour permettre l'upload d'avatars
-- À exécuter dans Supabase SQL Editor (nécessite des permissions spéciales)

-- 1. S'assurer que RLS est activé sur storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les politiques existantes si elles existent (pour éviter les erreurs)
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can read avatars" ON storage.objects;

-- 3. Politique pour permettre aux utilisateurs authentifiés d'uploader leurs propres avatars
-- Format de fichier: {user_id}-{timestamp}.{ext}
-- La politique vérifie que le nom de fichier commence par l'UUID de l'utilisateur
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

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================
-- Pour vérifier que les politiques sont bien créées, exécutez :
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

