-- ============================================================================
-- CRÉER LA TABLE beta_codes POUR LA GESTION DES CODES D'ACCÈS BÊTA
-- ============================================================================

-- Créer la table beta_codes si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.beta_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  note TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Créer un index pour améliorer les performances de recherche par code
CREATE INDEX IF NOT EXISTS idx_beta_codes_code ON public.beta_codes(code);
CREATE INDEX IF NOT EXISTS idx_beta_codes_is_active ON public.beta_codes(is_active);

-- Créer un index pour la recherche par créateur
CREATE INDEX IF NOT EXISTS idx_beta_codes_created_by ON public.beta_codes(created_by);

-- Activer RLS
ALTER TABLE public.beta_codes ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique (pour vérifier les codes)
CREATE POLICY "Public can read beta_codes"
ON public.beta_codes
FOR SELECT
TO public
USING (true);

-- Politique pour permettre seulement aux admins de modifier
CREATE POLICY "Admin can manage beta_codes"
ON public.beta_codes
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.email = 'gabi@naeliv.com'
  )
);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_beta_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_beta_codes_updated_at
BEFORE UPDATE ON public.beta_codes
FOR EACH ROW
EXECUTE FUNCTION update_beta_codes_updated_at();

-- Vérifier
SELECT * FROM public.beta_codes LIMIT 1;

