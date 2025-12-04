# ✅ Vérifier que l'utilisateur existe dans Supabase

## Problème

Si l'utilisateur `test2@naeliv.com` n'existe pas dans la table `profiles`, l'email ne peut pas être inséré.

## Solution : Vérifier et créer l'utilisateur

### Option 1 : Via l'interface Supabase

1. Allez dans **Supabase Dashboard** > **Table Editor** > **profiles**
2. Cherchez `test2@naeliv.com`
3. Si l'utilisateur n'existe pas, créez-le :
   - Allez sur https://naeliv.com/inscription
   - Créez un compte avec `test2@naeliv.com`
   - Confirmez l'email si nécessaire

### Option 2 : Via SQL (si vous avez accès)

```sql
-- Vérifier si l'utilisateur existe
SELECT * FROM profiles WHERE email = 'test2@naeliv.com';

-- Si aucun résultat, l'utilisateur n'existe pas
-- Créez-le via l'interface d'inscription
```

### Option 3 : Créer directement via SQL (avancé)

⚠️ **Attention** : Cette méthode contourne l'inscription normale. Utilisez-la seulement pour les tests.

```sql
-- 1. Créer l'utilisateur dans auth.users (si pas déjà fait)
-- (Normalement fait automatiquement lors de l'inscription)

-- 2. Vérifier que le profil existe
INSERT INTO profiles (id, email, first_name, plan, created_at)
SELECT 
  id,
  email,
  split_part(email, '@', 1) as first_name,
  'essential' as plan,
  now() as created_at
FROM auth.users
WHERE email = 'test2@naeliv.com'
ON CONFLICT (id) DO NOTHING;
```

## Vérification

Après avoir créé l'utilisateur :

1. Vérifiez dans Supabase que le profil existe
2. Envoyez un nouvel email vers `test2@naeliv.com`
3. Vérifiez les logs Vercel pour voir si l'email est inséré
4. Vérifiez dans `/mail` si l'email apparaît

