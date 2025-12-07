/**
 * Utilitaires pour identifier et afficher les logos des fournisseurs d'email
 */

export interface EmailProviderInfo {
  name: string;
  logoType: 'icon' | 'text';
  logoContent: string;
  color: string;
}

/**
 * Extrait le domaine d'une adresse email
 */
export function extractDomain(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return null;
  }
  
  const parts = email.split('@');
  if (parts.length !== 2) {
    return null;
  }
  
  return parts[1].toLowerCase();
}

/**
 * Obtient les informations du fournisseur d'email basé sur le domaine
 */
export function getEmailProvider(domain: string | null): EmailProviderInfo | null {
  if (!domain) {
    return null;
  }

  const domainLower = domain.toLowerCase();

  // Mapping des domaines principaux
  const providers: Record<string, EmailProviderInfo> = {
    'gmail.com': {
      name: 'Gmail',
      logoType: 'text',
      logoContent: 'G',
      color: '#EA4335'
    },
    'naver.com': {
      name: 'Naver',
      logoType: 'text',
      logoContent: 'N',
      color: '#03C75A'
    },
    'outlook.com': {
      name: 'Outlook',
      logoType: 'text',
      logoContent: 'O',
      color: '#0078D4'
    },
    'hotmail.com': {
      name: 'Hotmail',
      logoType: 'text',
      logoContent: 'O',
      color: '#0078D4'
    },
    'yahoo.com': {
      name: 'Yahoo',
      logoType: 'text',
      logoContent: 'Y!',
      color: '#6001D2'
    },
    'icloud.com': {
      name: 'iCloud',
      logoType: 'text',
      logoContent: 'i',
      color: '#3693F3'
    },
    'protonmail.com': {
      name: 'ProtonMail',
      logoType: 'text',
      logoContent: 'P',
      color: '#6D4AFF'
    },
    'proton.me': {
      name: 'Proton',
      logoType: 'text',
      logoContent: 'P',
      color: '#6D4AFF'
    },
    'naeliv.com': {
      name: 'Naeliv',
      logoType: 'text',
      logoContent: 'N',
      color: '#9333EA'
    },
    'mail.com': {
      name: 'Mail.com',
      logoType: 'text',
      logoContent: 'M',
      color: '#0066CC'
    },
    'aol.com': {
      name: 'AOL',
      logoType: 'text',
      logoContent: 'AOL',
      color: '#3399FF'
    },
    'zoho.com': {
      name: 'Zoho',
      logoType: 'text',
      logoContent: 'Z',
      color: '#CC0000'
    },
    'yandex.com': {
      name: 'Yandex',
      logoType: 'text',
      logoContent: 'Y',
      color: '#FC3F1D'
    },
    'tutanota.com': {
      name: 'Tutanota',
      logoType: 'text',
      logoContent: 'T',
      color: '#840010'
    }
  };

  // Chercher une correspondance exacte
  if (providers[domainLower]) {
    return providers[domainLower];
  }

  // Chercher une correspondance partielle (pour les sous-domaines)
  for (const [key, value] of Object.entries(providers)) {
    if (domainLower.includes(key) || key.includes(domainLower.split('.')[0])) {
      return value;
    }
  }

  // Retourner null si aucun fournisseur connu
  return null;
}

/**
 * Valide le format d'un email (validation simple côté client)
 */
export function isValidEmailFormat(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Parse une chaîne d'emails séparés par des virgules ou points-virgules
 */
export function parseEmailList(emailString: string): string[] {
  if (!emailString || typeof emailString !== 'string') {
    return [];
  }

  return emailString
    .split(/[,;]/)
    .map(email => email.trim())
    .filter(email => email.length > 0);
}

