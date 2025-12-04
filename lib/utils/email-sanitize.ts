import DOMPurify from 'isomorphic-dompurify';

/**
 * Configuration de sécurité pour la sanitization des emails HTML
 * Niveau de sécurité : Gmail/Outlook
 */
const SANITIZE_CONFIG = {
  // Tags HTML autorisés (liste blanche stricte)
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 'b', 'i',
    'a', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote', 'code', 'pre',
    'div', 'span',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'img',
  ],
  
  // Attributs autorisés
  ALLOWED_ATTR: [
    'href', 'title', 'target', 'rel', // Pour les liens
    'src', 'alt', 'width', 'height', // Pour les images
    'class', 'style', // Pour le style (avec précaution)
  ],
  
  // Ne pas autoriser les data-attributes (souvent utilisés pour XSS)
  ALLOW_DATA_ATTR: false,
  
  // Forcer les liens à s'ouvrir dans un nouvel onglet avec sécurité
  ADD_ATTR: ['target'],
  ADD_TAGS: [],
  
  // Désactiver les scripts et événements
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
};

/**
 * Nettoie le HTML d'un email pour éviter les attaques XSS
 * ⚠️ CRITIQUE : Utilisez cette fonction AVANT d'afficher tout HTML provenant d'emails externes
 * 
 * @param html - Le HTML brut de l'email
 * @returns Le HTML nettoyé et sécurisé
 */
export function sanitizeEmailHTML(html: string | null | undefined): string {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  // Nettoyer le HTML avec DOMPurify
  const cleanHTML = DOMPurify.sanitize(html, SANITIZE_CONFIG);
  
  // Post-traitement : forcer les liens externes à s'ouvrir dans un nouvel onglet avec sécurité
  const withSecureLinks = cleanHTML.replace(
    /<a\s+([^>]*?)href=["']([^"']*?)["']([^>]*?)>/gi,
    (match, before, href, after) => {
      // Vérifier si c'est un lien externe
      const isExternal = href && !href.startsWith('#') && !href.startsWith('/');
      
      if (isExternal) {
        // Ajouter target="_blank" et rel="noopener noreferrer" pour la sécurité
        let secureMatch = match;
        if (!secureMatch.includes('target=')) {
          secureMatch = secureMatch.replace('>', ' target="_blank" rel="noopener noreferrer">');
        } else if (!secureMatch.includes('rel=')) {
          secureMatch = secureMatch.replace('target=', 'target="_blank" rel="noopener noreferrer" target=');
        }
        return secureMatch;
      }
      
      return match;
    }
  );
  
  return withSecureLinks;
}

/**
 * Extrait un texte brut sécurisé depuis du HTML
 */
export function extractTextFromHTML(html: string | null | undefined): string {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  // Nettoyer d'abord le HTML
  const cleanHTML = sanitizeEmailHTML(html);
  
  // Extraire le texte (supprimer les tags HTML)
  const text = cleanHTML
    .replace(/<[^>]*>/g, ' ') // Supprimer les tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/\s+/g, ' ') // Normaliser les espaces
    .trim();
  
  return text;
}

/**
 * Génère un preview sécurisé d'un email
 */
export function generateEmailPreview(
  html: string | null | undefined,
  text: string | null | undefined,
  maxLength: number = 100
): string {
  // Préférer le texte brut s'il existe
  const source = text || extractTextFromHTML(html);
  
  if (!source) {
    return '';
  }
  
  // Tronquer et ajouter "..."
  const preview = source.substring(0, maxLength).trim();
  return source.length > maxLength ? preview + '...' : preview;
}

