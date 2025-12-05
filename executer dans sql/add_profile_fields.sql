-- Ajouter les colonnes first_name, last_name et avatar_url à la table profiles
-- Si elles n'existent pas déjà

-- Vérifier et ajouter first_name
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'first_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN first_name TEXT;
    END IF;
END $$;

-- Vérifier et ajouter last_name
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'last_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN last_name TEXT;
    END IF;
END $$;

-- Vérifier et ajouter avatar_url
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

