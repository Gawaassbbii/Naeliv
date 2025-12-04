-- ============================================================================
-- VALIDATION : SEULS LES EMAILS @klar.app SONT AUTORISÉS
-- ============================================================================
-- Ce script ajoute une validation au niveau de la base de données
-- pour s'assurer que seuls les emails @klar.app peuvent être utilisés
-- ============================================================================

-- ============================================================================
-- 1. FONCTION DE VALIDATION DU DOMAINE EMAIL
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_klar_app_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier que l'email se termine par @klar.app
  IF NEW.email NOT LIKE '%@klar.app' THEN
    RAISE EXCEPTION 'Seules les adresses email @klar.app sont autorisées. Email fourni: %', NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. TRIGGER SUR LA TABLE PROFILES
-- ============================================================================

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS validate_email_domain_profiles ON profiles;

-- Créer le trigger avant l'insertion
CREATE TRIGGER validate_email_domain_profiles
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_klar_app_email();

-- ============================================================================
-- 3. FONCTION POUR VALIDER L'EMAIL LORS DE L'INSCRIPTION
-- ============================================================================
-- Cette fonction remplace handle_new_user() pour ajouter la validation

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier que l'email se termine par @klar.app
  IF NEW.email NOT LIKE '%@klar.app' THEN
    RAISE EXCEPTION 'Seules les adresses email @klar.app sont autorisées. Email fourni: %', NEW.email;
  END IF;
  
  -- Créer le profil
  INSERT INTO public.profiles (id, email, first_name, last_name, username, plan)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'username',
    COALESCE(NEW.raw_user_meta_data->>'plan', 'essential')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. CONTRAINTE CHECK SUR LA TABLE PROFILES (optionnel, redondant avec trigger)
-- ============================================================================

-- Ajouter une contrainte CHECK pour valider le domaine
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS check_email_domain;

ALTER TABLE profiles
ADD CONSTRAINT check_email_domain
CHECK (email LIKE '%@klar.app');

-- ============================================================================
-- 5. VÉRIFIER LES EMAILS EXISTANTS (si vous avez déjà des utilisateurs)
-- ============================================================================

-- Voir tous les emails qui ne sont pas @klar.app
-- SELECT id, email 
-- FROM auth.users 
-- WHERE email NOT LIKE '%@klar.app';

-- Voir tous les profils qui ne sont pas @klar.app
-- SELECT id, email 
-- FROM profiles 
-- WHERE email NOT LIKE '%@klar.app';

-- ============================================================================
-- 6. NETTOYER LES EMAILS INVALIDES (à utiliser avec précaution)
-- ============================================================================

-- ⚠️ ATTENTION : Cette requête supprime les utilisateurs avec des emails invalides
-- Ne l'exécutez que si vous êtes sûr de vouloir supprimer ces comptes
-- 
-- DELETE FROM auth.users 
-- WHERE email NOT LIKE '%@klar.app';

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
-- Après avoir exécuté ce script :
-- 1. Tous les nouveaux utilisateurs doivent avoir un email @klar.app
-- 2. Les tentatives d'inscription avec d'autres domaines seront rejetées
-- 3. Les mises à jour de profil avec des emails invalides seront rejetées
-- ============================================================================

