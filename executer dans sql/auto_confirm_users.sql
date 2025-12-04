-- ============================================================================
-- AUTO-CONFIRMATION DES UTILISATEURS (POUR PHASE DE TEST)
-- ============================================================================
-- Ce script vérifie automatiquement tous les utilisateurs non vérifiés
-- Utilisez-le uniquement pour le développement, pas en production !
-- ============================================================================

-- Vérifier automatiquement tous les utilisateurs non vérifiés
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- Vérifier l'état des utilisateurs
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
-- TRIGGER POUR AUTO-CONFIRMER LES NOUVEAUX UTILISATEURS
-- ============================================================================
-- Ce trigger vérifie automatiquement chaque nouvel utilisateur créé

CREATE OR REPLACE FUNCTION auto_confirm_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier automatiquement l'email du nouvel utilisateur
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id AND email_confirmed_at IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;

-- Créer le trigger pour auto-confirmer les nouveaux utilisateurs
CREATE TRIGGER on_auth_user_created_auto_confirm
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_new_user();

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
-- Après avoir exécuté ce script :
-- 1. Tous les utilisateurs existants seront vérifiés
-- 2. Tous les nouveaux utilisateurs seront automatiquement vérifiés
-- ============================================================================

