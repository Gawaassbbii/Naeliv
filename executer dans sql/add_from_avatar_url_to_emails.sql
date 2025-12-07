-- ============================================================================
-- AJOUT DE LA COLONNE from_avatar_url À LA TABLE emails
-- ============================================================================
-- Exécutez ce script dans l'éditeur SQL de Supabase pour ajouter le champ
-- pour stocker l'avatar de l'expéditeur
-- ============================================================================

-- Ajouter la colonne from_avatar_url à la table emails
ALTER TABLE emails 
ADD COLUMN IF NOT EXISTS from_avatar_url TEXT;

-- Créer un index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_emails_from_avatar_url ON emails(from_avatar_url) WHERE from_avatar_url IS NOT NULL;

-- Commentaire pour documentation
COMMENT ON COLUMN emails.from_avatar_url IS 'URL de la photo de profil de l''expéditeur (pour les utilisateurs @naeliv.com)';

