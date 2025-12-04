-- ============================================================================
-- AJOUT DES COLONNES POUR L'ENVOI D'EMAILS
-- ============================================================================
-- Exécutez ce script dans l'éditeur SQL de Supabase pour ajouter les colonnes
-- nécessaires pour l'envoi d'emails et la section "Répondus"
-- ============================================================================

-- Ajouter les colonnes manquantes à la table emails
ALTER TABLE emails 
ADD COLUMN IF NOT EXISTS folder TEXT DEFAULT 'inbox',
ADD COLUMN IF NOT EXISTS in_reply_to TEXT,
ADD COLUMN IF NOT EXISTS message_id TEXT,
ADD COLUMN IF NOT EXISTS email_references TEXT,
ADD COLUMN IF NOT EXISTS to_email TEXT[],
ADD COLUMN IF NOT EXISTS text_content TEXT,
ADD COLUMN IF NOT EXISTS html_content TEXT;

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_emails_folder ON emails(folder) WHERE folder IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_emails_in_reply_to ON emails(in_reply_to) WHERE in_reply_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_emails_message_id ON emails(message_id) WHERE message_id IS NOT NULL;

-- Commentaires pour documentation
COMMENT ON COLUMN emails.folder IS 'Dossier de l''email: inbox, sent, etc.';
COMMENT ON COLUMN emails.in_reply_to IS 'Message-ID de l''email auquel on répond (pour les réponses)';
COMMENT ON COLUMN emails.message_id IS 'Message-ID unique de l''email';
COMMENT ON COLUMN emails.email_references IS 'Message-IDs de la conversation (pour le fil de discussion)';
COMMENT ON COLUMN emails.to_email IS 'Tableau des destinataires de l''email';
COMMENT ON COLUMN emails.text IS 'Version texte de l''email';
COMMENT ON COLUMN emails.html IS 'Version HTML de l''email';

