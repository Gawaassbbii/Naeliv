-- ============================================================================
-- SYNCHRONISER TOUS LES COMPTES PRO
-- ============================================================================
-- Ce script met à jour tous les comptes avec plan = 'pro' pour avoir aussi is_pro = true
-- et vice versa, pour assurer la cohérence
-- ============================================================================

-- 0. Ajouter la colonne is_pro si elle n'existe pas (au cas où)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT FALSE;

-- 1. Mettre is_pro = true pour tous les comptes avec plan = 'pro'
UPDATE public.profiles
SET is_pro = true
WHERE plan = 'pro' AND (is_pro IS NULL OR is_pro = false);

-- 2. Mettre plan = 'pro' pour tous les comptes avec is_pro = true
UPDATE public.profiles
SET plan = 'pro'
WHERE is_pro = true AND (plan IS NULL OR plan != 'pro');

-- 3. Afficher un résumé des comptes PRO
SELECT 
  id,
  email,
  username,
  plan,
  is_pro,
  CASE 
    WHEN plan = 'pro' AND is_pro = true THEN '✅ PRO (cohérent)'
    WHEN plan = 'pro' AND (is_pro IS NULL OR is_pro = false) THEN '⚠️ plan=pro mais is_pro=false'
    WHEN (plan IS NULL OR plan != 'pro') AND is_pro = true THEN '⚠️ is_pro=true mais plan!=pro'
    ELSE '❌ Pas PRO'
  END as status,
  created_at,
  updated_at
FROM public.profiles
WHERE plan = 'pro' OR is_pro = true
ORDER BY email;

-- 4. Compter les comptes PRO
SELECT 
  COUNT(*) as total_pro_accounts,
  COUNT(CASE WHEN plan = 'pro' AND is_pro = true THEN 1 END) as coherent_pro,
  COUNT(CASE WHEN plan = 'pro' AND (is_pro IS NULL OR is_pro = false) THEN 1 END) as plan_pro_only,
  COUNT(CASE WHEN (plan IS NULL OR plan != 'pro') AND is_pro = true THEN 1 END) as is_pro_only
FROM public.profiles
WHERE plan = 'pro' OR is_pro = true;

