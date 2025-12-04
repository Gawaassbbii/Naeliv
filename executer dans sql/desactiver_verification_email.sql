-- ============================================================================
-- DÉSACTIVER LA VÉRIFICATION D'EMAIL DANS SUPABASE
-- ============================================================================
-- ⚠️ ATTENTION : Ce script désactive la vérification d'email
-- Utilisez-le uniquement pour le développement, pas en production !
-- ============================================================================

-- Note : Cette configuration se fait dans le tableau de bord Supabase
-- et non via SQL. Voici les étapes :

-- 1. Allez dans Authentication > Settings dans votre tableau de bord Supabase
-- 2. Dans la section "Email Auth", désactivez "Enable email confirmations"
-- 3. Sauvegardez les changements

-- ============================================================================
-- ALTERNATIVE : Vérifier manuellement les utilisateurs via SQL
-- ============================================================================

-- Pour vérifier manuellement tous les utilisateurs non vérifiés :
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Pour vérifier un utilisateur spécifique par email :
-- UPDATE auth.users
-- SET email_confirmed_at = NOW()
-- WHERE email = 'votre_nom@klar.app';

-- ============================================================================
-- VÉRIFIER L'ÉTAT DES UTILISATEURS
-- ============================================================================

-- Voir tous les utilisateurs et leur statut de vérification :
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'Vérifié'
    ELSE 'Non vérifié'
  END as status
FROM auth.users
ORDER BY created_at DESC;

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================

