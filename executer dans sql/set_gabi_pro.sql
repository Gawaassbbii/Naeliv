-- ============================================================================
-- METTRE GABI@NAELIV.COM EN PRO
-- ============================================================================
-- Ce script met à jour le profil de gabi@naeliv.com pour le rendre PRO
-- ============================================================================

-- Mettre à jour le profil de gabi@naeliv.com pour le rendre PRO
UPDATE public.profiles
SET 
  plan = 'pro',
  is_pro = true
WHERE email = 'gabi@naeliv.com';

-- Vérifier que la mise à jour a bien été effectuée
SELECT 
  id,
  email,
  username,
  plan,
  is_pro,
  created_at,
  updated_at
FROM public.profiles
WHERE email = 'gabi@naeliv.com';

-- Si le profil n'existe pas, le créer
INSERT INTO public.profiles (id, email, username, plan, is_pro)
SELECT 
  u.id,
  u.email,
  SPLIT_PART(u.email, '@', 1) as username,
  'pro' as plan,
  true as is_pro
FROM auth.users u
WHERE u.email = 'gabi@naeliv.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
  )
ON CONFLICT (id) DO UPDATE SET
  plan = 'pro',
  is_pro = true,
  email = EXCLUDED.email;

