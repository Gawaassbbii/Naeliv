-- ============================================================================
-- AJOUTER LA COLONNE is_pro ET SYNCHRONISER TOUS LES COMPTES PRO
-- ============================================================================
-- Ce script :
-- 1. Ajoute la colonne is_pro si elle n'existe pas
-- 2. Synchronise tous les comptes avec plan = 'pro' pour avoir is_pro = true
-- 3. Affiche un rapport des comptes PRO
-- ============================================================================

-- 1. Ajouter la colonne is_pro si elle n'existe pas
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT FALSE;

-- 2. Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_profiles_is_pro ON public.profiles(is_pro) WHERE is_pro = true;

-- 3. Synchroniser : Mettre is_pro = true pour tous les comptes avec plan = 'pro'
UPDATE public.profiles
SET is_pro = true
WHERE plan = 'pro' AND (is_pro IS NULL OR is_pro = false);

-- 4. Synchroniser : Mettre plan = 'pro' pour tous les comptes avec is_pro = true
UPDATE public.profiles
SET plan = 'pro'
WHERE is_pro = true AND (plan IS NULL OR plan != 'pro');

-- 5. Afficher un résumé des comptes PRO
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

-- 6. Compter les comptes PRO
SELECT 
  COUNT(*) as total_pro_accounts,
  COUNT(CASE WHEN plan = 'pro' AND is_pro = true THEN 1 END) as coherent_pro,
  COUNT(CASE WHEN plan = 'pro' AND (is_pro IS NULL OR is_pro = false) THEN 1 END) as plan_pro_only,
  COUNT(CASE WHEN (plan IS NULL OR plan != 'pro') AND is_pro = true THEN 1 END) as is_pro_only
FROM public.profiles
WHERE plan = 'pro' OR is_pro = true;

-- 7. Vérifier que tous les comptes avec plan = 'pro' ont maintenant is_pro = true
SELECT 
  COUNT(*) as comptes_pro_sans_is_pro
FROM public.profiles
WHERE plan = 'pro' AND (is_pro IS NULL OR is_pro = false);

-- Si le résultat est 0, tous les comptes PRO sont bien synchronisés ✅

