-- ============================================================================
-- PERMETTRE L'INSERTION D'EMAILS VIA WEBHOOK (API)
-- ============================================================================
-- Ce script crée une fonction PostgreSQL sécurisée qui permet à l'API
-- webhook d'insérer des emails dans la table emails, même avec RLS activé.
-- ============================================================================

-- 1. Créer une fonction qui insère un email en contournant RLS de manière sécurisée
CREATE OR REPLACE FUNCTION insert_email_via_webhook(
  p_user_id UUID,
  p_from_email TEXT,
  p_from_name TEXT,
  p_subject TEXT,
  p_body TEXT,
  p_body_html TEXT,
  p_preview TEXT,
  p_has_paid_stamp BOOLEAN DEFAULT FALSE,
  p_archived BOOLEAN DEFAULT FALSE,
  p_deleted BOOLEAN DEFAULT FALSE,
  p_starred BOOLEAN DEFAULT FALSE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Permet d'exécuter avec les privilèges du créateur de la fonction
AS $$
DECLARE
  v_email_id UUID;
  v_user_exists BOOLEAN;
BEGIN
  -- Vérifier que l'utilisateur existe
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = p_user_id) INTO v_user_exists;
  
  IF NOT v_user_exists THEN
    RAISE EXCEPTION 'User does not exist: %', p_user_id;
  END IF;

  -- Insérer l'email
  INSERT INTO public.emails (
    user_id,
    from_email,
    from_name,
    subject,
    body,
    body_html,
    preview,
    received_at,
    has_paid_stamp,
    archived,
    deleted,
    starred,
    created_at,
    updated_at
  )
  VALUES (
    p_user_id,
    p_from_email,
    p_from_name,
    p_subject,
    p_body,
    p_body_html,
    p_preview,
    NOW(),
    p_has_paid_stamp,
    p_archived,
    p_deleted,
    p_starred,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_email_id;

  RETURN v_email_id;
END;
$$;

-- 2. Donner les permissions nécessaires
-- La fonction est SECURITY DEFINER, donc elle s'exécute avec les privilèges du créateur
-- Pas besoin de permissions supplémentaires pour les utilisateurs

-- 3. Créer une politique RLS supplémentaire pour permettre l'insertion via service role
-- (Cette politique n'est pas nécessaire si on utilise la fonction SECURITY DEFINER)
-- Mais on peut l'ajouter pour plus de flexibilité

-- Note: Les politiques RLS existantes restent en place pour les opérations normales
-- La fonction insert_email_via_webhook contourne RLS de manière sécurisée

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================
-- Pour tester la fonction (remplacer les valeurs par des valeurs réelles):
-- 
-- SELECT insert_email_via_webhook(
--   'user-uuid-here'::UUID,
--   'sender@example.com',
--   'Sender Name',
--   'Test Subject',
--   'Test body',
--   '<p>Test HTML body</p>',
--   'Test preview',
--   false,
--   false,
--   false,
--   false
-- );
-- ============================================================================

