-- ============================================================================
-- AJOUT DU CHAMP TÉLÉPHONE ET STARRED
-- ============================================================================
-- Exécutez ce script dans l'éditeur SQL de Supabase pour ajouter les nouveaux champs
-- ============================================================================

-- Ajouter le champ téléphone à profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

-- Ajouter le champ starred et autres champs manquants à emails
ALTER TABLE emails 
ADD COLUMN IF NOT EXISTS starred BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS preview TEXT,
ADD COLUMN IF NOT EXISTS has_paid_stamp BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS days_ago INTEGER DEFAULT 0;

-- Créer un index pour starred
CREATE INDEX IF NOT EXISTS idx_emails_starred ON emails(starred) WHERE starred = TRUE;
CREATE INDEX IF NOT EXISTS idx_emails_archived ON emails(archived) WHERE archived = TRUE;

-- Créer une table pour les codes de vérification SMS
CREATE TABLE IF NOT EXISTS phone_verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les codes de vérification
CREATE INDEX IF NOT EXISTS idx_phone_verification_user_id ON phone_verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_verification_phone ON phone_verification_codes(phone);
CREATE INDEX IF NOT EXISTS idx_phone_verification_code ON phone_verification_codes(code);

-- RLS pour phone_verification_codes
ALTER TABLE phone_verification_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own verification codes" ON phone_verification_codes;
CREATE POLICY "Users can read own verification codes"
  ON phone_verification_codes FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own verification codes" ON phone_verification_codes;
CREATE POLICY "Users can insert own verification codes"
  ON phone_verification_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own verification codes" ON phone_verification_codes;
CREATE POLICY "Users can update own verification codes"
  ON phone_verification_codes FOR UPDATE
  USING (auth.uid() = user_id);

