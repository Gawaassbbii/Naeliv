import crypto from 'crypto';

/**
 * Vérifie la signature du webhook Resend
 */
export function verifyResendSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret) {
    console.error('📧 [SIGNATURE] Signature ou secret manquant');
    return false;
  }

  try {
    // Resend utilise le format: signature = HMAC-SHA256(body, secret)
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(body).digest('hex');
    
    // Log de débogage (à retirer en production)
    console.log('📧 [SIGNATURE] Comparaison:', {
      signatureLength: signature.length,
      digestLength: digest.length,
      signatureStart: signature.substring(0, 10),
      digestStart: digest.substring(0, 10),
      match: signature === digest,
    });
    
    // Utiliser timingSafeEqual pour éviter les attaques par timing
    // Mais d'abord vérifier la longueur pour éviter les erreurs
    if (signature.length !== digest.length) {
      console.error('📧 [SIGNATURE] Longueurs différentes:', {
        signature: signature.length,
        digest: digest.length,
      });
      return false;
    }
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(digest)
    );
  } catch (error) {
    console.error('📧 [SIGNATURE] Erreur vérification:', error);
    return false;
  }
}

/**
 * Vérifie la signature du webhook Mailgun
 */
export function verifyMailgunSignature(
  token: string,
  timestamp: string,
  signature: string,
  apiKey: string
): boolean {
  if (!token || !timestamp || !signature || !apiKey) {
    return false;
  }

  try {
    // Vérifier que le timestamp n'est pas trop ancien (max 15 minutes)
    const timestampNum = parseInt(timestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestampNum) > 900) {
      return false; // Timestamp trop ancien ou dans le futur
    }

    const encodedToken = crypto
      .createHmac('sha256', apiKey)
      .update(timestamp + token)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(encodedToken)
    );
  } catch (error) {
    console.error('Error verifying Mailgun signature:', error);
    return false;
  }
}

/**
 * Valide que l'email provient d'un domaine autorisé (optionnel)
 */
export function validateEmailDomain(email: string, allowedDomains?: string[]): boolean {
  if (!allowedDomains || allowedDomains.length === 0) {
    return true; // Pas de restriction
  }

  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? allowedDomains.includes(domain) : false;
}

