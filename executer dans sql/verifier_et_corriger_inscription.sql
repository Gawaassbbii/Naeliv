-- ============================================================================
-- VÉRIFICATION ET CORRECTION DES PROBLÈMES D'INSCRIPTION
-- ============================================================================
-- Ce script vérifie et corrige les problèmes courants lors de l'inscription
-- ============================================================================

-- 1. Vérifier et corriger les emails non confirmés
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- 2. Vérifier et créer les profils manquants
INSERT INTO public.profiles (id, email, first_name, last_name, username, plan)
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'first_name' as first_name,
  u.raw_user_meta_data->>'last_name' as last_name,
  COALESCE(
    u.raw_user_meta_data->>'username',
    SPLIT_PART(u.email, '@', 1)
  ) as username,
  COALESCE(u.raw_user_meta_data->>'plan', 'essential') as plan
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
  AND u.email LIKE '%@naeliv.com'
ON CONFLICT (id) DO NOTHING;

-- 3. Créer ou remplacer la fonction auto_confirm_new_user
CREATE OR REPLACE FUNCTION auto_confirm_new_user()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id AND email_confirmed_at IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Supprimer et recréer le trigger auto_confirm_new_user
DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_auto_confirm
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_new_user();

-- 5. Créer ou remplacer la fonction handle_new_user
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
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    username = EXCLUDED.username,
    plan = EXCLUDED.plan;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erreur lors de la création du profil: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Supprimer et recréer le trigger handle_new_user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7. Afficher un résumé des utilisateurs
SELECT 
  u.id,
  u.email,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN 'Vérifié'
    ELSE 'Non vérifié'
  END as email_status,
  CASE 
    WHEN p.id IS NOT NULL THEN 'Profil créé'
    ELSE 'Profil manquant'
  END as profile_status,
  p.plan,
  p.username,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email LIKE '%@naeliv.com'
ORDER BY u.created_at DESC
LIMIT 20;

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
-- Ce script :
-- 1. Confirme tous les emails non confirmés
-- 2. Crée les profils manquants pour les utilisateurs existants
-- 3. Crée ou remplace les fonctions et triggers nécessaires
-- 4. Affiche un résumé des utilisateurs
-- ============================================================================
