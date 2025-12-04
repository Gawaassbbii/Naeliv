-- ============================================================================
-- VALIDATION : SEULS LES EMAILS @klar.ch SONT AUTORISÉS
-- ============================================================================
-- Ce script ajoute une validation au niveau de la base de données
-- pour s'assurer que seuls les emails @klar.ch peuvent être utilisés
-- ============================================================================

-- ============================================================================
-- 1. FONCTION DE VALIDATION DU DOMAINE EMAIL
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
-- 2. TRIGGER SUR LA TABLE PROFILES
-- ============================================================================

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS validate_email_domain_profiles ON profiles;

-- Créer le trigger avant l'insertion
CREATE TRIGGER validate_email_domain_profiles
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_klar_ch_email();

-- ============================================================================
-- 3. FONCTION POUR VALIDER L'EMAIL LORS DE L'INSCRIPTION
-- ============================================================================
-- Cette fonction remplace handle_new_user() pour ajouter la validation

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier que l'email se termine par @klar.ch
  IF NEW.email NOT LIKE '%@klar.ch' THEN
    RAISE EXCEPTION 'Seules les adresses email @klar.ch sont autorisées. Email fourni: %', NEW.email;
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
-- 4. VÉRIFICATION ET MISE À JOUR DES EMAILS EXISTANTS
-- ============================================================================
-- IMPORTANT : Mettre à jour les emails existants de @klar.app vers @klar.ch
-- avant d'ajouter la contrainte

-- Vérifier d'abord quels emails doivent être mis à jour
-- (Décommentez ces lignes pour voir les emails à modifier)
-- SELECT id, email FROM profiles WHERE email NOT LIKE '%@klar.ch';
-- SELECT id, email FROM auth.users WHERE email NOT LIKE '%@klar.ch';

-- Mettre à jour les emails dans la table profiles
UPDATE profiles
SET email = REPLACE(email, '@klar.app', '@klar.ch')
WHERE email LIKE '%@klar.app';

-- Mettre à jour les emails dans auth.users (si nécessaire)
UPDATE auth.users
SET email = REPLACE(email, '@klar.app', '@klar.ch')
WHERE email LIKE '%@klar.app';

-- Mettre à jour aussi raw_user_meta_data si l'email y est stocké
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data,
  '{email}',
  to_jsonb(REPLACE(raw_user_meta_data->>'email', '@klar.app', '@klar.ch'))
)
WHERE raw_user_meta_data->>'email' LIKE '%@klar.app';

-- ============================================================================
-- 5. CONTRAINTE CHECK SUR LA TABLE PROFILES
-- ============================================================================

-- Supprimer l'ancienne contrainte si elle existe
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS check_email_domain;

-- Ajouter la nouvelle contrainte CHECK pour valider le domaine
-- Utilisation d'une regex pour être plus précis
ALTER TABLE profiles
ADD CONSTRAINT check_email_domain
CHECK (email ~ '@klar\.ch$');

-- ============================================================================
-- 6. VÉRIFIER LES EMAILS EXISTANTS (si vous avez déjà des utilisateurs)
-- ============================================================================

-- Voir tous les emails qui ne sont pas @klar.ch
-- SELECT id, email 
-- FROM auth.users 
-- WHERE email NOT LIKE '%@klar.ch';

-- Voir tous les profils qui ne sont pas @klar.ch
-- SELECT id, email 
-- FROM profiles 
-- WHERE email NOT LIKE '%@klar.ch';

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
-- Après avoir exécuté ce script :
-- 1. Tous les nouveaux utilisateurs doivent avoir un email @klar.ch
-- 2. Les tentatives d'inscription avec d'autres domaines seront rejetées
-- 3. Les mises à jour de profil avec des emails invalides seront rejetées
-- ============================================================================

