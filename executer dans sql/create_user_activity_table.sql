-- ============================================================================
-- CRÉER LA TABLE user_activity POUR TRACKER LES UTILISATEURS EN LIGNE
-- ============================================================================

-- Créer la table user_activity si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_last_seen ON public.user_activity(last_seen_at);

-- Activer RLS
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de mettre à jour leur propre activité
CREATE POLICY "Users can update their own activity"
ON public.user_activity
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs d'insérer leur propre activité
CREATE POLICY "Users can insert their own activity"
ON public.user_activity
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_user_activity_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS update_user_activity_updated_at_trigger ON public.user_activity;
CREATE TRIGGER update_user_activity_updated_at_trigger
  BEFORE UPDATE ON public.user_activity
  FOR EACH ROW
  EXECUTE FUNCTION update_user_activity_updated_at();

-- Fonction pour upsert l'activité utilisateur
CREATE OR REPLACE FUNCTION upsert_user_activity(
  p_user_id UUID,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_activity (user_id, last_seen_at, ip_address, user_agent)
  VALUES (p_user_id, NOW(), p_ip_address, p_user_agent)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    last_seen_at = NOW(),
    ip_address = COALESCE(EXCLUDED.ip_address, user_activity.ip_address),
    user_agent = COALESCE(EXCLUDED.user_agent, user_activity.user_agent),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vérifier
SELECT 'Table user_activity créée avec succès' as status;

