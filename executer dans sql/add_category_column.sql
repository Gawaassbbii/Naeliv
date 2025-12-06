-- ============================================================================
-- AJOUT DE LA COLONNE CATEGORY POUR LE SMART SORTER IA
-- ============================================================================
-- Exécutez ce script dans l'éditeur SQL de Supabase pour ajouter la colonne category
-- qui sera utilisée par le Smart Sorter pour catégoriser automatiquement les emails
-- ============================================================================

-- Ajouter la colonne category à la table emails
ALTER TABLE emails 
ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN ('Finance', 'Updates', 'Personal', 'Spam', 'Work'));

-- Créer un index pour améliorer les performances des requêtes par catégorie
CREATE INDEX IF NOT EXISTS idx_emails_category ON emails(category) WHERE category IS NOT NULL;

-- Commentaire pour documenter la colonne
COMMENT ON COLUMN emails.category IS 'Catégorie automatique générée par IA (Smart Sorter) pour les membres PRO';

