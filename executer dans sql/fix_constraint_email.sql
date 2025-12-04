-- ============================================================================
-- CORRECTION DE LA CONTRAINTE EMAIL
-- ============================================================================
-- Ce script corrige le problème de contrainte sur les emails
-- ============================================================================

-- 1. SUPPRIMER L'ANCIEN TRIGGER ET FONCTION
DROP TRIGGER IF EXISTS validate_email_domain_profiles ON profiles;
DROP FUNCTION IF EXISTS validate_klar_app_email();

-- 2. Supprimer complètement l'ancienne contrainte si elle existe
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS check_email_domain;

-- 2. CORRIGER LES EMAILS EXISTANTS AVANT D'AJOUTER LA CONTRAINTE
-- Mettre à jour @klar.app → @klar.ch
UPDATE profiles
SET email = REPLACE(email, '@klar.app', '@klar.ch')
WHERE email LIKE '%@klar.app';

UPDATE auth.users
SET email = REPLACE(email, '@klar.app', '@klar.ch')
WHERE email LIKE '%@klar.app';

-- 3. VÉRIFIER QU'IL N'Y A PLUS D'EMAILS INVALIDES
-- Cette requête ne devrait retourner AUCUNE ligne
-- Si elle retourne des lignes, vous devez les corriger manuellement
SELECT 'ATTENTION - Emails invalides à corriger:', id, email 
FROM profiles 
WHERE email NOT LIKE '%@klar.ch';

-- 4. CRÉER LA NOUVELLE FONCTION ET TRIGGER POUR @klar.ch
CREATE OR REPLACE FUNCTION validate_klar_ch_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email NOT LIKE '%@klar.ch' THEN
    RAISE EXCEPTION 'Seules les adresses email @klar.ch sont autorisées. Email fourni: %', NEW.email;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_email_domain_profiles
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_klar_ch_email();

-- 5. Recréer la contrainte avec une syntaxe plus explicite
-- (Ne s'exécute que si l'étape 3 ne retourne aucune ligne)
ALTER TABLE profiles
ADD CONSTRAINT check_email_domain
CHECK (email ~ '@klar\.ch$');

-- Alternative si la regex ne fonctionne pas :
-- ALTER TABLE profiles
-- ADD CONSTRAINT check_email_domain
-- CHECK (RIGHT(email, 7) = '@klar.ch');

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================

-- Tester que la contrainte fonctionne
-- Cette requête devrait retourner toutes les lignes valides
SELECT id, email 
FROM profiles 
WHERE email ~ '@klar\.ch$';

-- Cette requête ne devrait retourner aucune ligne
SELECT id, email 
FROM profiles 
WHERE email !~ '@klar\.ch$';

