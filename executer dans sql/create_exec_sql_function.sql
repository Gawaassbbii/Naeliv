-- ============================================================================
-- Création de la fonction exec_sql pour exécuter du SQL dynamique
-- ============================================================================
-- Cette fonction permet d'exécuter du SQL dynamique via l'API REST de Supabase
-- À exécuter UNE SEULE FOIS dans Supabase SQL Editor
-- ⚠️ Nécessite des permissions d'administrateur

CREATE OR REPLACE FUNCTION exec_sql(query_text text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
BEGIN
  EXECUTE query_text;
END;
$$;

-- Vérification
SELECT 'Fonction exec_sql créée avec succès' AS status;

