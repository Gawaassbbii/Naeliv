-- ============================================================================
-- VALIDATION : SEULS LES EMAILS @naeliv.com SONT AUTORISÉS
-- ============================================================================
-- Ce script met à jour la validation du domaine email vers @naeliv.com
-- ============================================================================

-- ============================================================================
-- 1. SUPPRIMER LES ANCIENS TRIGGERS ET FONCTIONS
-- ============================================================================

DROP TRIGGER IF EXISTS validate_email_domain_profiles ON profiles;
DROP FUNCTION IF EXISTS validate_klar_app_email();
DROP FUNCTION IF EXISTS validate_klar_ch_email();

-- ============================================================================
-- 2. SUPPRIMER L'ANCIENNE CONTRAINTE
-- ============================================================================

ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS check_email_domain;

-- ============================================================================
-- 2.1. NETTOYER LES DONNÉES EXISTANTES
-- ============================================================================
-- En phase de test, on supprime tous les profils avec des emails invalides
-- Si vous voulez conserver les données, décommentez la partie UPDATE ci-dessous

-- Option 1: Supprimer les profils avec des emails invalides (recommandé en phase de test)
DELETE FROM profiles
WHERE email NOT LIKE '%@naeliv.com';

-- Option 2: Mettre à jour les emails @klar.app ou @klar.ch vers @naeliv.com (si vous voulez conserver les données)
-- UPDATE profiles
-- SET email = REPLACE(REPLACE(email, '@klar.app', '@naeliv.com'), '@klar.ch', '@naeliv.com')
-- WHERE email LIKE '%@klar.app' OR email LIKE '%@klar.ch';
--
-- -- Supprimer les autres emails invalides
-- DELETE FROM profiles
-- WHERE email NOT LIKE '%@naeliv.com';

-- ============================================================================
-- 3. METTRE À JOUR LA FONCTION handle_new_user() POUR @naeliv.com
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier que l'email se termine par @naeliv.com
  IF NEW.email NOT LIKE '%@naeliv.com' THEN
    RAISE EXCEPTION 'Seules les adresses email @naeliv.com sont autorisées. Email fourni: %', NEW.email;
  END IF;
  
  -- Créer le profil
  INSERT INTO public.profiles (id, email, first_name, last_name, username, plan)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'plan', 'essential')
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'erreur pour le débogage
    RAISE EXCEPTION 'Erreur lors de la création du profil: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. CRÉER LA FONCTION DE VALIDATION POUR LA TABLE PROFILES
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_naeliv_com_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier que l'email se termine par @naeliv.com
  IF NEW.email NOT LIKE '%@naeliv.com' THEN
    RAISE EXCEPTION 'Seules les adresses email @naeliv.com sont autorisées. Email fourni: %', NEW.email;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. CRÉER LE TRIGGER SUR LA TABLE PROFILES
-- ============================================================================

CREATE TRIGGER validate_email_domain_profiles
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_naeliv_com_email();

-- ============================================================================
-- 6. AJOUTER LA CONTRAINTE CHECK (optionnel, redondant avec trigger)
-- ============================================================================
-- La contrainte est ajoutée seulement si toutes les données sont valides

ALTER TABLE profiles
ADD CONSTRAINT check_email_domain
CHECK (email LIKE '%@naeliv.com');

-- ============================================================================
-- 7. VÉRIFIER LE TRIGGER SUR auth.users
-- ============================================================================

-- S'assurer que le trigger existe bien
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
-- Après avoir exécuté ce script, testez la création d'un compte avec
-- une adresse @naeliv.com pour vérifier que tout fonctionne.
-- ============================================================================

