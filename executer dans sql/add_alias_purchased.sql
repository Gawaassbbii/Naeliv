-- ============================================================================
-- AJOUT DU CHAMP alias_purchased
-- ============================================================================
-- Exécutez ce script dans l'éditeur SQL de Supabase pour ajouter le champ
-- qui indique si l'utilisateur a acheté son alias (nom d'utilisateur)
-- ============================================================================

-- Ajouter le champ alias_purchased à profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS alias_purchased BOOLEAN DEFAULT FALSE;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_alias_purchased ON profiles(alias_purchased) WHERE alias_purchased = TRUE;

-- Commentaire pour documenter le champ
COMMENT ON COLUMN profiles.alias_purchased IS 'Indique si l''utilisateur a acheté son alias (nom d''utilisateur) pour 60€. Permet d''utiliser l''adresse email sans abonnement PRO.';

