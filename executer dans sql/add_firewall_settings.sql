-- ============================================================================
-- AJOUT DES COLONNES POUR LE PARE-FEU
-- ============================================================================
-- Exécutez ce script dans l'éditeur SQL de Supabase pour ajouter les champs
-- permettant de bloquer des domaines d'emails et d'autoriser des exceptions
-- ============================================================================

-- Ajouter les colonnes blocked_domains et whitelisted_senders à profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS blocked_domains TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS whitelisted_senders TEXT[] DEFAULT '{}';

-- Créer des index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_profiles_blocked_domains ON profiles USING GIN (blocked_domains) WHERE array_length(blocked_domains, 1) > 0;
CREATE INDEX IF NOT EXISTS idx_profiles_whitelisted_senders ON profiles USING GIN (whitelisted_senders) WHERE array_length(whitelisted_senders, 1) > 0;

-- Commentaires pour documenter les champs
COMMENT ON COLUMN profiles.blocked_domains IS 'Liste des domaines d''emails bloqués (ex: gmail.com, yahoo.fr). Si un domaine est dans cette liste, tous les emails de ce domaine seront bloqués sauf ceux dans whitelisted_senders.';
COMMENT ON COLUMN profiles.whitelisted_senders IS 'Liste des adresses email spécifiques autorisées même si leur domaine est bloqué (ex: maman@gmail.com). Ces emails passeront toujours le pare-feu.';

