-- ============================================================================
-- AJOUT DE LA COLONNE CC_EMAIL À LA TABLE EMAILS
-- ============================================================================
-- Ce script ajoute le support pour les emails en copie carbone (CC)
-- ============================================================================

-- Ajouter la colonne cc_email (tableau d'emails) à la table emails
ALTER TABLE emails 
ADD COLUMN IF NOT EXISTS cc_email TEXT[];

-- Ajouter un index pour améliorer les performances des requêtes avec CC
CREATE INDEX IF NOT EXISTS idx_emails_cc_email ON emails USING GIN(cc_email) WHERE cc_email IS NOT NULL;

-- Commentaire sur la colonne
COMMENT ON COLUMN emails.cc_email IS 'Liste des adresses email en copie carbone (CC)';

SELECT 'Colonne cc_email ajoutée avec succès à la table emails' as status;

