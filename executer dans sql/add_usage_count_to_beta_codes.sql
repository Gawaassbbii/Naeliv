-- ============================================================================
-- AJOUTER LA COLONNE usage_count À LA TABLE beta_codes (si elle n'existe pas)
-- ============================================================================

-- Ajouter la colonne usage_count si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'beta_codes' 
    AND column_name = 'usage_count'
  ) THEN
    ALTER TABLE public.beta_codes 
    ADD COLUMN usage_count INTEGER DEFAULT 0;
    
    -- Mettre à jour les valeurs existantes à 0 si NULL
    UPDATE public.beta_codes 
    SET usage_count = 0 
    WHERE usage_count IS NULL;
    
    RAISE NOTICE 'Colonne usage_count ajoutée avec succès';
  ELSE
    RAISE NOTICE 'Colonne usage_count existe déjà';
  END IF;
END $$;

-- Vérifier
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'beta_codes' 
AND column_name = 'usage_count';

