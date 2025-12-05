-- ============================================================================
-- VÉRIFICATION ET CRÉATION DU PROFIL gabi@naeliv.com
-- ============================================================================
-- Ce script vérifie si le profil existe et le crée si nécessaire
-- ============================================================================

-- 1. Vérifier si l'utilisateur existe dans auth.users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'gabi@naeliv.com';

-- 2. Vérifier si le profil existe
SELECT 
  id,
  email,
  username,
  plan,
  created_at
FROM profiles
WHERE email = 'gabi@naeliv.com';

-- 3. Créer le profil s'il n'existe pas mais que l'utilisateur existe dans auth.users
INSERT INTO profiles (id, email, username, plan, first_name, last_name)
SELECT 
  u.id,
  u.email,
  'gabi' as username,
  'pro' as plan,
  COALESCE(u.raw_user_meta_data->>'first_name', 'Gabriel') as first_name,
  COALESCE(u.raw_user_meta_data->>'last_name', '') as last_name
FROM auth.users u
WHERE u.email = 'gabi@naeliv.com'
  AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = u.id
  )
ON CONFLICT (id) DO NOTHING;

-- 4. Vérifier le résultat
SELECT 
  p.id,
  p.email,
  p.username,
  p.plan,
  p.first_name,
  p.last_name,
  u.email_confirmed_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email = 'gabi@naeliv.com';

