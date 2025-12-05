# Créer le bucket "avatars" dans Supabase Storage

Pour que l'upload de photos de profil fonctionne, vous devez créer un bucket nommé `avatars` dans Supabase Storage.

## Étapes

1. **Ouvrez le tableau de bord Supabase**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet

2. **Accédez à Storage**
   - Dans le menu de gauche, cliquez sur **Storage**

3. **Créez un nouveau bucket**
   - Cliquez sur le bouton **"New bucket"** ou **"Créer un bucket"**
   - Nom du bucket : `avatars`
   - **Important** : Cochez **"Public bucket"** pour que les images soient accessibles publiquement
   - Cliquez sur **"Create bucket"**

4. **Configurez les permissions (optionnel mais recommandé)**
   - Allez dans **Storage** > **Policies**
   - Créez une politique pour le bucket `avatars` :
     - **Policy name** : `Users can upload their own avatars`
     - **Allowed operation** : `INSERT`
     - **Policy definition** :
       ```sql
       (bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])
       ```
     - **Policy name** : `Users can update their own avatars`
     - **Allowed operation** : `UPDATE`
     - **Policy definition** :
       ```sql
       (bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])
       ```
     - **Policy name** : `Public can read avatars`
     - **Allowed operation** : `SELECT`
     - **Policy definition** :
       ```sql
       bucket_id = 'avatars'::text
       ```

5. **Alternative : Politique simple (moins sécurisée mais plus simple)**
   Si vous voulez une solution plus simple, vous pouvez créer une politique qui permet à tous les utilisateurs authentifiés d'uploader :
   ```sql
   -- Politique pour INSERT (upload)
   CREATE POLICY "Authenticated users can upload avatars"
   ON storage.objects
   FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'avatars');
   
   -- Politique pour UPDATE (mise à jour)
   CREATE POLICY "Authenticated users can update avatars"
   ON storage.objects
   FOR UPDATE
   TO authenticated
   USING (bucket_id = 'avatars');
   
   -- Politique pour SELECT (lecture publique)
   CREATE POLICY "Public can read avatars"
   ON storage.objects
   FOR SELECT
   TO public
   USING (bucket_id = 'avatars');
   ```

## Vérification

Après avoir créé le bucket, essayez d'uploader une photo de profil dans les paramètres. Si vous rencontrez encore des erreurs, vérifiez :

1. Le bucket est bien nommé `avatars` (en minuscules)
2. Le bucket est marqué comme **Public**
3. Les politiques RLS sont correctement configurées
4. Vérifiez la console du navigateur pour voir les erreurs détaillées

