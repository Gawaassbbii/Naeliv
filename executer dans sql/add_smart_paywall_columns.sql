-- Script SQL pour ajouter les colonnes nécessaires au Smart Paywall

-- 1. Ajouter status à la table emails
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'emails' AND column_name = 'status'
  ) THEN
    ALTER TABLE emails ADD COLUMN status TEXT DEFAULT 'inbox' CHECK (status IN ('inbox', 'archived', 'trash', 'quarantine'));
    COMMENT ON COLUMN emails.status IS 'Statut de l''email: inbox, archived, trash, ou quarantine (en attente de paiement)';
    
    -- Mettre à jour les emails existants
    UPDATE emails SET status = 'inbox' WHERE status IS NULL;
  END IF;
END $$;

-- 2. Ajouter les colonnes paywall à la table profiles
DO $$ 
BEGIN
  -- Ajouter paywall_enabled si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'paywall_enabled'
  ) THEN
    ALTER TABLE profiles ADD COLUMN paywall_enabled BOOLEAN DEFAULT false;
    COMMENT ON COLUMN profiles.paywall_enabled IS 'Active ou désactive le Smart Paywall';
  END IF;

  -- Ajouter paywall_price si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'paywall_price'
  ) THEN
    ALTER TABLE profiles ADD COLUMN paywall_price INTEGER DEFAULT 10;
    COMMENT ON COLUMN profiles.paywall_price IS 'Prix du timbre en centimes (défaut: 10 = 0,10€)';
  END IF;

  -- Ajouter credits_balance si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'credits_balance'
  ) THEN
    ALTER TABLE profiles ADD COLUMN credits_balance INTEGER DEFAULT 0;
    COMMENT ON COLUMN profiles.credits_balance IS 'Solde de crédits en centimes (gains du Smart Paywall)';
  END IF;
END $$;

-- 3. Créer la table transactions pour l'historique des crédits
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  description TEXT,
  stripe_payment_intent_id TEXT,
  email_id UUID REFERENCES emails(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_emails_status ON emails(status);
CREATE INDEX IF NOT EXISTS idx_emails_user_status ON emails(user_id, status);

-- 4. RLS (Row Level Security) pour transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent voir leurs propres transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent insérer leurs propres transactions (via API uniquement)
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Vérifier que la table contacts existe et a une colonne is_trusted ou whitelisted
-- (Cette colonne est utilisée pour la whitelist des contacts)

