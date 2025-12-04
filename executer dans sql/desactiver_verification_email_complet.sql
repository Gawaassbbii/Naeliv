-- ============================================================================
-- DÉSACTIVER LA VÉRIFICATION D'EMAIL (POUR PHASE DE TEST)
-- ============================================================================
-- Ce script désactive complètement la vérification d'email dans Supabase
-- ⚠️ À UTILISER UNIQUEMENT EN DÉVELOPPEMENT, PAS EN PRODUCTION !
-- ============================================================================

-- 1. Confirmer tous les emails existants
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- 2. Créer ou remplacer la fonction auto_confirm_new_user
CREATE OR REPLACE FUNCTION auto_confirm_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Confirmer automatiquement l'email du nouvel utilisateur
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id AND email_confirmed_at IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Supprimer et recréer le trigger auto_confirm_new_user
DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_auto_confirm
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_new_user();

-- 4. Vérifier l'état des utilisateurs
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Vérifié'
    ELSE '❌ Non vérifié'
  END as status
FROM auth.users
WHERE email LIKE '%@naeliv.com'
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- INSTRUCTIONS SUPABASE DASHBOARD
-- ============================================================================
-- Pour désactiver complètement la vérification d'email dans Supabase :
-- 
-- 1. Allez dans Authentication > Settings
-- 2. Dans la section "Email Auth", décochez "Enable email confirmations"
-- 3. Sauvegardez les modifications
--
-- Cela permettra aux utilisateurs de se connecter immédiatement après l'inscription
-- sans avoir besoin de confirmer leur email.
-- ============================================================================



