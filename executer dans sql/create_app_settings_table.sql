-- ============================================================================
-- CRÉER LA TABLE app_settings POUR LE MODE MAINTENANCE
-- ============================================================================

-- Créer la table app_settings si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON public.app_settings(key);

-- Activer RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique (pour vérifier le statut de maintenance)
CREATE POLICY "Public can read app_settings"
ON public.app_settings
FOR SELECT
TO public
USING (true);

-- Politique pour permettre seulement aux admins de modifier (on utilise service_role en pratique)
-- Cette politique permet seulement à gabi@naeliv.com de modifier via l'API
CREATE POLICY "Admin can update app_settings"
ON public.app_settings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.email = 'gabi@naeliv.com'
  )
);

CREATE POLICY "Admin can insert app_settings"
ON public.app_settings
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.email = 'gabi@naeliv.com'
  )
);

-- Initialiser avec maintenance désactivée
INSERT INTO public.app_settings (key, value, description)
VALUES ('maintenance_mode', 'false', 'Mode maintenance: active/desactive l''acces au site (true/false)')
ON CONFLICT (key) DO NOTHING;

-- Vérifier
SELECT * FROM public.app_settings WHERE key = 'maintenance_mode';

