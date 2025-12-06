# Guide : Configurer les politiques RLS pour le bucket "avatars"

## Problème
L'erreur "new row violates row-level security policy" indique que les politiques RLS ne sont pas configurées pour le bucket `avatars`.

## Solution : Configuration via Supabase Dashboard

### Étape 1 : Accéder aux politiques Storage

1. Ouvrez votre **Supabase Dashboard**
2. Allez dans **Storage** (menu de gauche)
3. Cliquez sur **Policies** (onglet en haut)
4. Sélectionnez le bucket **`avatars`** dans la liste déroulante

### Étape 2 : Créer les politiques

Pour chaque politique ci-dessous, cliquez sur **"New Policy"** et configurez :

#### Politique 1 : Upload d'avatars (INSERT)

- **Policy name** : `Authenticated users can upload avatars`
- **Allowed operation** : `INSERT`
- **Target roles** : `authenticated`
- **Policy definition** (USING expression) : Laissez vide
- **Policy definition** (WITH CHECK expression) :
```sql
bucket_id = 'avatars' AND (string_to_array(name, '-'))[1] = (auth.uid())::text
```

#### Politique 2 : Mise à jour d'avatars (UPDATE)

- **Policy name** : `Users can update their own avatars`
- **Allowed operation** : `UPDATE`
- **Target roles** : `authenticated`
- **Policy definition** (USING expression) :
```sql
bucket_id = 'avatars' AND (string_to_array(name, '-'))[1] = (auth.uid())::text
```
- **Policy definition** (WITH CHECK expression) :
```sql
bucket_id = 'avatars' AND (string_to_array(name, '-'))[1] = (auth.uid())::text
```

#### Politique 3 : Suppression d'avatars (DELETE)

- **Policy name** : `Users can delete their own avatars`
- **Allowed operation** : `DELETE`
- **Target roles** : `authenticated`
- **Policy definition** (USING expression) :
```sql
bucket_id = 'avatars' AND (string_to_array(name, '-'))[1] = (auth.uid())::text
```

#### Politique 4 : Lecture publique (SELECT)

- **Policy name** : `Public can read avatars`
- **Allowed operation** : `SELECT`
- **Target roles** : `public`
- **Policy definition** (USING expression) :
```sql
bucket_id = 'avatars'
```

### Étape 3 : Vérifier la configuration

1. Dans **Storage** → **Policies**, vous devriez voir 4 politiques pour le bucket `avatars`
2. Testez l'upload d'une photo de profil dans l'application

## Alternative : Script SQL avec permissions Service Role

Si vous avez accès au **Service Role Key** (⚠️ **ATTENTION** : Ne l'utilisez jamais côté client !), vous pouvez exécuter le script SQL via l'API Supabase avec les permissions appropriées.

### Méthode recommandée

Utilisez l'interface Dashboard comme décrit ci-dessus. C'est plus sûr et plus simple.

## Format des noms de fichiers

Les fichiers doivent être nommés au format : `{user_id}-{timestamp}.{ext}`

Exemple : `550e8400-e29b-41d4-a716-446655440000-1701878400000.jpg`

Le code de l'application génère automatiquement ce format.

## Dépannage

### L'upload échoue toujours

1. Vérifiez que le bucket `avatars` existe
2. Vérifiez que les 4 politiques sont bien créées
3. Vérifiez que le format du nom de fichier correspond : `{user_id}-{timestamp}.{ext}`
4. Vérifiez les logs de la console du navigateur pour plus de détails

### Le bucket n'existe pas

Créez-le via :
- **Storage** → **New bucket**
- Nom : `avatars`
- Public : `Yes` (recommandé pour les avatars)

