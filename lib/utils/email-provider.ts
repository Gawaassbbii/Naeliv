/**
 * Utilitaires pour identifier et afficher les logos des fournisseurs d'email
 */

export interface EmailProviderInfo {
  name: string;
  logo: string | React.ReactNode;
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
      logo: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
        </svg>
      ),
      color: '#EA4335'
    },
    'naver.com': {
      name: 'Naver',
      logo: (
        <span className="font-bold text-[10px] text-[#03C75A]">N</span>
      ),
      color: '#03C75A'
    },
    'outlook.com': {
      name: 'Outlook',
      logo: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M7.5 13.5L1.5 9.75 7.5 6v7.5zm3 0V6l6 3.75L10.5 13.5zm0 0l-3 1.875v-1.875l3-1.875zm-3 0v1.875L1.5 15 4.5 13.5z"/>
        </svg>
      ),
      color: '#0078D4'
    },
    'hotmail.com': {
      name: 'Hotmail',
      logo: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M7.5 13.5L1.5 9.75 7.5 6v7.5zm3 0V6l6 3.75L10.5 13.5zm0 0l-3 1.875v-1.875l3-1.875zm-3 0v1.875L1.5 15 4.5 13.5z"/>
        </svg>
      ),
      color: '#0078D4'
    },
    'yahoo.com': {
      name: 'Yahoo',
      logo: (
        <span className="font-bold text-[10px] text-[#6001D2]">Y!</span>
      ),
      color: '#6001D2'
    },
    'icloud.com': {
      name: 'iCloud',
      logo: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M13.762 4.29a6.051 6.051 0 0 0-3.85 1.37 4.8 4.8 0 0 0-1.97 3.69 4.78 4.78 0 0 0-2.94-1.01c-2.6 0-4.7 2.11-4.7 4.7 0 .38.04.75.13 1.1-1.97.42-3.42 2.14-3.42 4.19 0 2.35 1.9 4.26 4.26 4.26h15.84c2.6 0 4.71-2.11 4.71-4.71 0-2.6-2.11-4.71-4.71-4.71-.07 0-.14.01-.21.01-.7-2.56-3.06-4.4-5.84-4.4z"/>
        </svg>
      ),
      color: '#3693F3'
    },
    'protonmail.com': {
      name: 'ProtonMail',
      logo: (
        <span className="font-bold text-[10px]">P</span>
      ),
      color: '#6D4AFF'
    },
    'proton.me': {
      name: 'Proton',
      logo: (
        <span className="font-bold text-[10px]">P</span>
      ),
      color: '#6D4AFF'
    },
    'naeliv.com': {
      name: 'Naeliv',
      logo: (
        <span className="font-bold text-[10px] text-purple-600">N</span>
      ),
      color: '#9333EA'
    },
    'mail.com': {
      name: 'Mail.com',
      logo: (
        <span className="font-bold text-[10px]">M</span>
      ),
      color: '#0066CC'
    },
    'aol.com': {
      name: 'AOL',
      logo: (
        <span className="font-bold text-[10px]">AOL</span>
      ),
      color: '#3399FF'
    },
    'zoho.com': {
      name: 'Zoho',
      logo: (
        <span className="font-bold text-[10px]">Z</span>
      ),
      color: '#CC0000'
    },
    'yandex.com': {
      name: 'Yandex',
      logo: (
        <span className="font-bold text-[10px]">Y</span>
      ),
      color: '#FC3F1D'
    },
    'tutanota.com': {
      name: 'Tutanota',
      logo: (
        <span className="font-bold text-[10px]">T</span>
      ),
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

