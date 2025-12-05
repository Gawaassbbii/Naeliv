-- Politiques RLS pour le bucket "avatars"
-- À exécuter APRÈS avoir créé le bucket "avatars" dans Supabase Storage

-- Supprimer les politiques existantes si elles existent (pour éviter les erreurs)
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can read avatars" ON storage.objects;

-- 1. Politique pour permettre aux utilisateurs authentifiés d'uploader leurs propres avatars
-- Format de fichier: {user_id}-{timestamp}.{ext}
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'::text
  AND (string_to_array(name, '-'))[1] = (auth.uid())::text
);

-- 2. Politique pour permettre aux utilisateurs de mettre à jour leurs propres avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'::text
  AND (string_to_array(name, '-'))[1] = (auth.uid())::text
)
WITH CHECK (
  bucket_id = 'avatars'::text
  AND (string_to_array(name, '-'))[1] = (auth.uid())::text
);

-- 3. Politique pour permettre aux utilisateurs de supprimer leurs propres avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'::text
  AND (string_to_array(name, '-'))[1] = (auth.uid())::text
);

-- 4. Politique pour permettre la lecture publique des avatars
CREATE POLICY "Public can read avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars'::text);

-- Note: Les noms de fichiers sont au format: {user_id}-{timestamp}.{ext}
-- La politique extrait l'UUID depuis le début du nom de fichier (avant le premier "-")

