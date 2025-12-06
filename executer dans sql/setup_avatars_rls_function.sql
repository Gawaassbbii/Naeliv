-- ============================================================================
-- Fonction SQL pour créer automatiquement les politiques RLS pour le bucket "avatars"
-- ============================================================================
-- Cette fonction peut être appelée via l'API REST : POST /rest/v1/rpc/setup_avatars_rls_policies
-- ⚠️ Nécessite des permissions d'administrateur pour créer des politiques RLS

CREATE OR REPLACE FUNCTION public.setup_avatars_rls_policies()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  result json;
BEGIN
  -- 1. S'assurer que RLS est activé sur storage.objects
  EXECUTE 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY';

  -- 2. Supprimer les politiques existantes si elles existent (pour éviter les erreurs)
  EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Public can read avatars" ON storage.objects';

  -- 3. Politique pour permettre aux utilisateurs authentifiés d'uploader leurs propres avatars
  -- Format de fichier: {user_id}-{timestamp}.{ext}
  -- La politique vérifie que le nom de fichier commence par l'UUID de l'utilisateur
  EXECUTE 'CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = ''avatars'' AND (string_to_array(name, ''-''))[1] = (auth.uid())::text)';

  -- 4. Politique pour permettre aux utilisateurs de mettre à jour leurs propres avatars
  EXECUTE 'CREATE POLICY "Users can update their own avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = ''avatars'' AND (string_to_array(name, ''-''))[1] = (auth.uid())::text) WITH CHECK (bucket_id = ''avatars'' AND (string_to_array(name, ''-''))[1] = (auth.uid())::text)';

  -- 5. Politique pour permettre aux utilisateurs de supprimer leurs propres avatars
  EXECUTE 'CREATE POLICY "Users can delete their own avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = ''avatars'' AND (string_to_array(name, ''-''))[1] = (auth.uid())::text)';

  -- 6. Politique pour permettre la lecture publique des avatars
  EXECUTE 'CREATE POLICY "Public can read avatars" ON storage.objects FOR SELECT TO public USING (bucket_id = ''avatars'')';

  -- Retourner un résultat de succès
  result := json_build_object(
    'success', true,
    'message', 'Politiques RLS créées avec succès pour le bucket avatars',
    'policies_created', 4
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    -- En cas d'erreur, retourner les détails
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Erreur lors de la création des politiques RLS'
    );
    RETURN result;
END;
$$;

-- Vérification
SELECT 'Fonction setup_avatars_rls_policies créée avec succès' AS status;

-- Pour tester la fonction manuellement :
-- SELECT public.setup_avatars_rls_policies();
