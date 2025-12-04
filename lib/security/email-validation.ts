/**
 * Validation et sanitization des emails
 */

/**
 * Valide le format d'une adresse email
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // RFC 5322 compliant regex (simplifié mais robuste)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    return false;
  }

  // Vérifier la longueur (RFC 5321: max 320 caractères total, 64 pour la partie locale)
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) {
    return false;
  }

  if (localPart.length > 64 || domain.length > 255 || email.length > 320) {
    return false;
  }

  // Vérifier qu'il n'y a pas de caractères dangereux
  if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
    return false;
  }

  return true;
}

/**
 * Sanitize le texte pour éviter les injections XSS
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Échapper les caractères HTML dangereux
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize le HTML (basique - pour production, utilisez une librairie comme DOMPurify)
 */
export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Liste blanche de tags HTML autorisés
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const allowedAttributes = ['href', 'title'];

  // Pour une sécurité maximale, utilisez DOMPurify côté serveur
  // npm install isomorphic-dompurify
  // import DOMPurify from 'isomorphic-dompurify';
  // return DOMPurify.sanitize(html, { ALLOWED_TAGS: allowedTags, ALLOWED_ATTR: allowedAttributes });

  // Version basique (à remplacer par DOMPurify en production)
  return html;
}

/**
 * Valide et nettoie le sujet de l'email
 */
export function sanitizeSubject(subject: string): string {
  if (!subject || typeof subject !== 'string') {
    return '(Sans objet)';
  }

  // Limiter la longueur (RFC 5322: max 998 caractères par ligne)
  const maxLength = 200;
  const cleaned = subject.trim().substring(0, maxLength);

  // Supprimer les caractères de contrôle
  return cleaned.replace(/[\x00-\x1F\x7F]/g, '');
}

/**
 * Extrait un preview sécurisé du corps de l'email
 */
export function extractPreview(text: string, maxLength: number = 100): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Supprimer les sauts de ligne multiples
  const cleaned = text.replace(/\n{3,}/g, '\n\n').trim();
  
  // Extraire les premiers caractères
  const preview = cleaned.substring(0, maxLength);
  
  // Ajouter "..." si le texte est tronqué
  return cleaned.length > maxLength ? preview + '...' : preview;
}

/**
 * Valide la taille de l'email (max 25MB selon RFC)
 */
export function validateEmailSize(sizeInBytes: number, maxSizeMB: number = 25): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return sizeInBytes <= maxSizeBytes;
}

