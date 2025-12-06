# Guide Simple : Configurer les politiques RLS pour les avatars

## ⚠️ Erreur "must be owner of table objects"

Cette erreur est normale. Vous ne pouvez pas modifier directement les tables `storage.objects` via SQL. Il faut utiliser l'interface Dashboard de Supabase.

## ✅ Solution : Dashboard Supabase (5 minutes)

### Étape 1 : Accéder aux politiques Storage

1. Ouvrez votre **Supabase Dashboard** : https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur **Storage**
4. Cliquez sur l'onglet **Policies** (en haut)
5. Dans la liste déroulante "Select a bucket", choisissez **`avatars`**

### Étape 2 : Créer les 4 politiques

Pour chaque politique, cliquez sur le bouton **"New Policy"** (en haut à droite) :

---

#### 🔵 Politique 1 : Upload (INSERT)

1. **Policy name** : `Authenticated users can upload avatars`
2. **Allowed operation** : Sélectionnez **`INSERT`**
3. **Target roles** : Sélectionnez **`authenticated`**
4. **Policy definition** :
   - **USING expression** : Laissez vide
   - **WITH CHECK expression** : Copiez-collez ceci :
   ```sql
   bucket_id = 'avatars' AND (string_to_array(name, '-'))[1] = (auth.uid())::text
   ```
5. Cliquez sur **"Review"** puis **"Save policy"**

---

#### 🟢 Politique 2 : Mise à jour (UPDATE)

1. **Policy name** : `Users can update their own avatars`
2. **Allowed operation** : Sélectionnez **`UPDATE`**
3. **Target roles** : Sélectionnez **`authenticated`**
4. **Policy definition** :
   - **USING expression** : Copiez-collez ceci :
   ```sql
   bucket_id = 'avatars' AND (string_to_array(name, '-'))[1] = (auth.uid())::text
   ```
   - **WITH CHECK expression** : Copiez-collez ceci :
   ```sql
   bucket_id = 'avatars' AND (string_to_array(name, '-'))[1] = (auth.uid())::text
   ```
5. Cliquez sur **"Review"** puis **"Save policy"**

---

#### 🔴 Politique 3 : Suppression (DELETE)

1. **Policy name** : `Users can delete their own avatars`
2. **Allowed operation** : Sélectionnez **`DELETE`**
3. **Target roles** : Sélectionnez **`authenticated`**
4. **Policy definition** :
   - **USING expression** : Copiez-collez ceci :
   ```sql
   bucket_id = 'avatars' AND (string_to_array(name, '-'))[1] = (auth.uid())::text
   ```
   - **WITH CHECK expression** : Laissez vide
5. Cliquez sur **"Review"** puis **"Save policy"**

---

#### 🟡 Politique 4 : Lecture publique (SELECT)

1. **Policy name** : `Public can read avatars`
2. **Allowed operation** : Sélectionnez **`SELECT`**
3. **Target roles** : Sélectionnez **`public`**
4. **Policy definition** :
   - **USING expression** : Copiez-collez ceci :
   ```sql
   bucket_id = 'avatars'
   ```
   - **WITH CHECK expression** : Laissez vide
5. Cliquez sur **"Review"** puis **"Save policy"**

---

### Étape 3 : Vérifier

Après avoir créé les 4 politiques, vous devriez voir :

- ✅ `Authenticated users can upload avatars` (INSERT)
- ✅ `Users can update their own avatars` (UPDATE)
- ✅ `Users can delete their own avatars` (DELETE)
- ✅ `Public can read avatars` (SELECT)

### Étape 4 : Tester

Retournez dans l'application et essayez d'uploader une photo de profil. Ça devrait fonctionner ! 🎉

---

## 📸 Capture d'écran de référence

L'interface devrait ressembler à ceci :

```
Storage > Policies > [avatars]

┌─────────────────────────────────────────────────┐
│  New Policy                          [New Policy]│
├─────────────────────────────────────────────────┤
│  Authenticated users can upload avatars (INSERT) │
│  Users can update their own avatars (UPDATE)    │
│  Users can delete their own avatars (DELETE)    │
│  Public can read avatars (SELECT)               │
└─────────────────────────────────────────────────┘
```

---

## ❓ Problèmes courants

### Le bucket "avatars" n'existe pas

Créez-le d'abord :
1. **Storage** → **Buckets** → **New bucket**
2. Nom : `avatars`
3. Public : `Yes` (recommandé)
4. Cliquez sur **"Create bucket"**

### Les politiques ne fonctionnent toujours pas

1. Vérifiez que vous avez bien sélectionné le bucket `avatars` dans la liste déroulante
2. Vérifiez que les expressions SQL sont exactement comme indiqué ci-dessus
3. Vérifiez que le format du nom de fichier est : `{user_id}-{timestamp}.{ext}`
   - Exemple : `550e8400-e29b-41d4-a716-446655440000-1701878400000.jpg`

---

## 🆘 Besoin d'aide ?

Si vous avez toujours des problèmes, vérifiez :
- Les logs de la console du navigateur
- Les logs de Supabase Dashboard → Logs
- Le format du nom de fichier généré par l'application

