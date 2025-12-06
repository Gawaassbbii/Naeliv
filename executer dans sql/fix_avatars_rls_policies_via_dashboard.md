# ⚠️ IMPORTANT : Ce script nécessite des permissions spéciales

## Pourquoi cette erreur ?

L'erreur `must be owner of table objects` apparaît car la table `storage.objects` est protégée par Supabase et nécessite des permissions d'administrateur de base de données.

## Solution : Utiliser l'interface Dashboard

**Suivez le guide détaillé** : `docs/GUIDE_CONFIGURER_RLS_AVATARS.md`

### Résumé rapide

1. Allez dans **Supabase Dashboard** → **Storage** → **Policies**
2. Sélectionnez le bucket **`avatars`**
3. Créez 4 politiques manuellement via l'interface :
   - **INSERT** : `Authenticated users can upload avatars`
   - **UPDATE** : `Users can update their own avatars`
   - **DELETE** : `Users can delete their own avatars`
   - **SELECT** : `Public can read avatars`

### Expressions SQL pour chaque politique

#### INSERT (WITH CHECK)
```sql
bucket_id = 'avatars' AND (string_to_array(name, '-'))[1] = (auth.uid())::text
```

#### UPDATE (USING et WITH CHECK)
```sql
bucket_id = 'avatars' AND (string_to_array(name, '-'))[1] = (auth.uid())::text
```

#### DELETE (USING)
```sql
bucket_id = 'avatars' AND (string_to_array(name, '-'))[1] = (auth.uid())::text
```

#### SELECT (USING)
```sql
bucket_id = 'avatars'
```

## Alternative : Service Role (avancé)

Si vous avez accès au **Service Role Key** et que vous savez ce que vous faites, vous pouvez utiliser l'API Supabase Management pour créer les politiques programmatiquement. Mais l'interface Dashboard est la méthode recommandée.

