// Import dynamique pour éviter les problèmes avec jsdom en serverless
let DOMPurify: any = null;
let dompurifyLoaded = false;

async function loadDOMPurify() {
  if (dompurifyLoaded) return DOMPurify;
  
  try {
    // Import dynamique pour éviter les erreurs en serverless
    const dompurifyModule = await import('isomorphic-dompurify');
    DOMPurify = dompurifyModule.default;
    dompurifyLoaded = true;
    return DOMPurify;
  } catch (error) {
    console.warn('⚠️ DOMPurify non disponible, utilisation de sanitization basique:', error);
    dompurifyLoaded = true; // Marquer comme chargé pour éviter de réessayer
    return null;
  }
}

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
 * Sanitization basique sans DOMPurify (fallback)
 */
function basicSanitize(html: string): string {
  // Supprimer les tags dangereux
  let clean = html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '') // Supprimer les événements onclick, onload, etc.
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '') // Supprimer javascript: dans les liens
    .replace(/data:/gi, ''); // Supprimer data: URLs
  
  return clean;
}

/**
 * Nettoie le HTML d'un email pour éviter les attaques XSS
 * ⚠️ CRITIQUE : Utilisez cette fonction AVANT d'afficher tout HTML provenant d'emails externes
 * 
 * @param html - Le HTML brut de l'email
 * @returns Le HTML nettoyé et sécurisé
 */
export async function sanitizeEmailHTML(html: string | null | undefined): Promise<string> {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  // Essayer de charger DOMPurify
  const dompurify = await loadDOMPurify();
  
  let cleanHTML: string;
  if (dompurify) {
    // Utiliser DOMPurify si disponible
    cleanHTML = dompurify.sanitize(html, SANITIZE_CONFIG);
  } else {
    // Fallback : sanitization basique
    cleanHTML = basicSanitize(html);
  }
  
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
export async function generateEmailPreview(
  html: string | null | undefined,
  text: string | null | undefined,
  maxLength: number = 100
): Promise<string> {
  // Préférer le texte brut s'il existe
  const source = text || await extractTextFromHTML(html);
  
  if (!source) {
    return '';
  }
  
  // Tronquer et ajouter "..."
  const preview = source.substring(0, maxLength).trim();
  return source.length > maxLength ? preview + '...' : preview;
}

