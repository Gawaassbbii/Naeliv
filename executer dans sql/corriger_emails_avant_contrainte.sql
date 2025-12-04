-- ============================================================================
-- CORRECTION DES EMAILS AVANT D'AJOUTER LA CONTRAINTE
-- ============================================================================
-- Ce script corrige tous les emails invalides avant d'ajouter la contrainte
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1 : SUPPRIMER LA CONTRAINTE EXISTANTE (si elle existe)
-- ============================================================================

ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS check_email_domain;

-- ============================================================================
-- ÉTAPE 2 : VÉRIFIER LES EMAILS INVALIDES
-- ============================================================================

-- Voir tous les emails qui ne sont PAS @klar.ch dans profiles
SELECT 'PROFILES - Emails invalides:', id, email 
FROM profiles 
WHERE email NOT LIKE '%@klar.ch'
ORDER BY email;

-- Voir tous les emails qui ne sont PAS @klar.ch dans auth.users
SELECT 'AUTH.USERS - Emails invalides:', id, email 
FROM auth.users 
WHERE email NOT LIKE '%@klar.ch'
ORDER BY email;

-- ============================================================================
-- ÉTAPE 3 : CORRIGER LES EMAILS @klar.app → @klar.ch
-- ============================================================================

-- Mettre à jour les emails dans la table profiles
UPDATE profiles
SET email = REPLACE(email, '@klar.app', '@klar.ch')
WHERE email LIKE '%@klar.app';

-- Mettre à jour les emails dans auth.users
UPDATE auth.users
SET email = REPLACE(email, '@klar.app', '@klar.ch')
WHERE email LIKE '%@klar.app';

-- ============================================================================
-- ÉTAPE 4 : GÉRER LES AUTRES DOMAINES INVALIDES
-- ============================================================================

-- Option A : Supprimer les profils avec des emails invalides (autres que @klar.ch)
-- ⚠️ ATTENTION : Cette commande supprime définitivement les données !
-- Décommentez seulement si vous êtes sûr de vouloir supprimer ces utilisateurs
-- 
-- DELETE FROM profiles
-- WHERE email NOT LIKE '%@klar.ch';

-- Option B : Mettre à jour manuellement les emails spécifiques
-- (Remplacez 'ancien@email.com' par l'email à corriger)
-- UPDATE profiles
-- SET email = 'nouveau@klar.ch'
-- WHERE email = 'ancien@email.com';

-- ============================================================================
-- ÉTAPE 5 : VÉRIFIER QU'IL N'Y A PLUS D'EMAILS INVALIDES
-- ============================================================================

-- Cette requête ne devrait retourner AUCUNE ligne
SELECT 'VÉRIFICATION - Emails encore invalides:', id, email 
FROM profiles 
WHERE email NOT LIKE '%@klar.ch';

-- Si cette requête retourne des lignes, vous devez les corriger avant de continuer

-- ============================================================================
-- ÉTAPE 6 : AJOUTER LA CONTRAINTE (seulement si l'étape 5 est vide)
-- ============================================================================

-- Ajouter la contrainte CHECK avec regex
ALTER TABLE profiles
ADD CONSTRAINT check_email_domain
CHECK (email ~ '@klar\.ch$');

-- ============================================================================
-- ÉTAPE 7 : VÉRIFICATION FINALE
-- ============================================================================

-- Vérifier que la contrainte fonctionne
SELECT 'SUCCÈS - Tous les emails sont valides:', COUNT(*) as total_profiles
FROM profiles
WHERE email ~ '@klar\.ch$';

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
-- Si vous avez encore des erreurs après ce script :
-- 1. Vérifiez l'étape 5 - il ne doit y avoir AUCUNE ligne
-- 2. Si des lignes apparaissent, corrigez-les manuellement
-- 3. Réexécutez seulement l'étape 6
-- ============================================================================

