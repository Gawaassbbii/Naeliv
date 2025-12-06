-- ============================================================================
-- AJOUT DE LA COLONNE is_beta_tester DANS LA TABLE profiles
-- ============================================================================
-- Cette colonne permet de distinguer les vrais utilisateurs des testeurs bêta
-- ============================================================================

-- Ajouter la colonne is_beta_tester
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_beta_tester BOOLEAN DEFAULT FALSE;

-- Index pour optimiser les requêtes de filtrage
CREATE INDEX IF NOT EXISTS idx_profiles_is_beta_tester ON profiles(is_beta_tester);

-- Mettre à jour la fonction handle_new_user pour prendre en compte is_beta_tester
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, username, plan, is_beta_tester)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'username',
    COALESCE(NEW.raw_user_meta_data->>'plan', 'essential'),
    COALESCE((NEW.raw_user_meta_data->>'is_beta_tester')::boolean, false)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================

