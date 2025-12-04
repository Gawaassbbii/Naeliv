-- ============================================================================
-- CORRECTION DU TRIGGER ET DE LA FONCTION DE VALIDATION
-- ============================================================================
-- Le problème : Le trigger utilise encore l'ancienne fonction qui vérifie @klar.app
-- Ce script corrige cela en mettant à jour ou supprimant le trigger
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1 : SUPPRIMER L'ANCIEN TRIGGER
-- ============================================================================

DROP TRIGGER IF EXISTS validate_email_domain_profiles ON profiles;

-- ============================================================================
-- ÉTAPE 2 : SUPPRIMER OU METTRE À JOUR L'ANCIENNE FONCTION
-- ============================================================================

-- Option A : Supprimer complètement l'ancienne fonction
DROP FUNCTION IF EXISTS validate_klar_app_email();

-- Option B : Ou la remplacer par la nouvelle (décommentez si vous préférez)
-- CREATE OR REPLACE FUNCTION validate_klar_app_email()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   -- Vérifier que l'email se termine par @klar.ch
--   IF NEW.email NOT LIKE '%@klar.ch' THEN
--     RAISE EXCEPTION 'Seules les adresses email @klar.ch sont autorisées. Email fourni: %', NEW.email;
--   END IF;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- ============================================================================
-- ÉTAPE 3 : CRÉER LA NOUVELLE FONCTION POUR @klar.ch
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_klar_ch_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier que l'email se termine par @klar.ch
  IF NEW.email NOT LIKE '%@klar.ch' THEN
    RAISE EXCEPTION 'Seules les adresses email @klar.ch sont autorisées. Email fourni: %', NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ÉTAPE 4 : CRÉER LE NOUVEAU TRIGGER AVEC LA BONNE FONCTION
-- ============================================================================

CREATE TRIGGER validate_email_domain_profiles
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_klar_ch_email();

-- ============================================================================
-- ÉTAPE 5 : SUPPRIMER L'ANCIENNE CONTRAINTE ET EN CRÉER UNE NOUVELLE
-- ============================================================================

ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS check_email_domain;

-- Corriger les emails existants
UPDATE profiles
SET email = REPLACE(email, '@klar.app', '@klar.ch')
WHERE email LIKE '%@klar.app';

UPDATE auth.users
SET email = REPLACE(email, '@klar.app', '@klar.ch')
WHERE email LIKE '%@klar.app';

-- Ajouter la nouvelle contrainte
ALTER TABLE profiles
ADD CONSTRAINT check_email_domain
CHECK (email ~ '@klar\.ch$');

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================

-- Vérifier que tout fonctionne
SELECT 'Vérification - Tous les emails valides:', COUNT(*) 
FROM profiles 
WHERE email ~ '@klar\.ch$';

-- Cette requête ne devrait retourner AUCUNE ligne
SELECT 'ATTENTION - Emails invalides:', id, email 
FROM profiles 
WHERE email !~ '@klar\.ch$';

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================

