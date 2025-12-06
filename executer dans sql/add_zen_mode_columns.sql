-- Script SQL pour ajouter les colonnes nécessaires au Zen Mode

-- 1. Ajouter zen_mode_enabled et zen_windows à la table profiles
DO $$ 
BEGIN
  -- Ajouter zen_mode_enabled si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'zen_mode_enabled'
  ) THEN
    ALTER TABLE profiles ADD COLUMN zen_mode_enabled BOOLEAN DEFAULT false;
    COMMENT ON COLUMN profiles.zen_mode_enabled IS 'Active ou désactive le Zen Mode pour cet utilisateur';
  END IF;

  -- Ajouter zen_windows si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'zen_windows'
  ) THEN
    ALTER TABLE profiles ADD COLUMN zen_windows TEXT[] DEFAULT ARRAY['09:00', '17:00'];
    COMMENT ON COLUMN profiles.zen_windows IS 'Fenêtres de livraison du Zen Mode au format HH:MM';
  END IF;
END $$;

-- 2. Ajouter visible_at à la table emails
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'emails' AND column_name = 'visible_at'
  ) THEN
    ALTER TABLE emails ADD COLUMN visible_at TIMESTAMPTZ DEFAULT NOW();
    COMMENT ON COLUMN emails.visible_at IS 'Date et heure à laquelle l''email sera visible (pour Zen Mode)';
    
    -- Définir visible_at = created_at pour tous les emails existants
    UPDATE emails SET visible_at = created_at WHERE visible_at IS NULL;
  END IF;
END $$;

-- 3. Créer un index pour optimiser les requêtes de filtrage
CREATE INDEX IF NOT EXISTS idx_emails_visible_at ON emails(visible_at);
CREATE INDEX IF NOT EXISTS idx_emails_user_visible_at ON emails(user_id, visible_at);

-- 4. Mettre à jour les emails existants pour qu'ils soient tous visibles
UPDATE emails SET visible_at = created_at WHERE visible_at IS NULL OR visible_at > created_at;

