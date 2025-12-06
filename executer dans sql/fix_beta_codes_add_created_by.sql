-- ============================================================================
-- AJOUTER LA COLONNE created_by À LA TABLE beta_codes
-- ============================================================================

-- Ajouter la colonne created_by si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'beta_codes' 
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.beta_codes
        ADD COLUMN created_by UUID REFERENCES auth.users(id);
        
        RAISE NOTICE 'Colonne "created_by" ajoutée à la table "beta_codes".';
    ELSE
        RAISE NOTICE 'La colonne "created_by" existe déjà dans la table "beta_codes".';
    END IF;
END
$$;

-- Vérifier
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'beta_codes'
ORDER BY ordinal_position;

