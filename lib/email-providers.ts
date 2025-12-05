export interface EmailProvider {
  name: string;
  id: string;
  icon?: string; // Pour l'affichage de l'icône plus tard
  category: string;
  domains: string[];
}

export const EMAIL_PROVIDERS: EmailProvider[] = [
  // ==========================================
  // 🌍 LES GÉANTS MONDIAUX (BIG TECH)
  // ==========================================
  {
    name: "Google (Gmail)",
    id: "google",
    icon: "google", // Pour l'affichage de l'icône plus tard
    category: "Global",
    domains: ["gmail.com", "googlemail.com"]
  },
  {
    name: "Microsoft (Outlook / Hotmail)",
    id: "microsoft",
    icon: "microsoft",
    category: "Global",
    domains: [
      // Global
      "outlook.com", "hotmail.com", "live.com", "msn.com", "windowslive.com", "passport.com",
      // France
      "outlook.fr", "hotmail.fr", "live.fr", "msn.fr",
      // Belgique
      "outlook.be", "hotmail.be", "live.be",
      // UK / International
      "hotmail.co.uk", "live.co.uk", "outlook.de", "hotmail.de", "live.de", "hotmail.it", "live.it", "hotmail.es"
    ]
  },
  {
    name: "Yahoo / AOL",
    id: "yahoo",
    icon: "yahoo",
    category: "Global",
    domains: [
      "yahoo.com", "ymail.com", "rocketmail.com", "aol.com", "aim.com", "verizon.net",
      "yahoo.fr", "yahoo.be", "yahoo.co.uk", "yahoo.de", "yahoo.it", "yahoo.es", "yahoo.com.br", "yahoo.co.jp"
    ]
  },
  {
    name: "Apple (iCloud)",
    id: "apple",
    icon: "apple",
    category: "Global",
    domains: ["icloud.com", "me.com", "mac.com"]
  },

  // ==========================================
  // 🛡️ SÉCURITÉ & VIE PRIVÉE (Tes concurrents)
  // ==========================================
  {
    name: "Proton Mail",
    id: "proton",
    category: "Privacy",
    domains: ["proton.me", "protonmail.com", "protonmail.ch", "pm.me"]
  },
  {
    name: "Tuta (Tutanota)",
    id: "tuta",
    category: "Privacy",
    domains: ["tuta.com", "tutanota.com", "tutanota.de", "tutamail.com", "tuta.io"]
  },
  {
    name: "Autres Services Privés",
    id: "privacy_others",
    category: "Privacy",
    domains: [
      "duck.com", "fastmail.com", "startmail.com", "mailbox.org", "posteo.de", 
      "zoho.com", "gmx.com", "mail.com", "hushmail.com", "runbox.com", "countermail.com"
    ]
  },

  // ==========================================
  // 🇪🇺 EUROPE (FAI & Historiques)
  // ==========================================
  {
    name: "France (FAI & Historique)",
    id: "fr_isp",
    category: "Europe",
    domains: [
      "orange.fr", "wanadoo.fr", "free.fr", "sfr.fr", "neuf.fr", "club-internet.fr",
      "laposte.net", "bbox.fr", "numericable.fr", "noos.fr", "aliceadsl.fr", "voila.fr", "libertysurf.fr"
    ]
  },
  {
    name: "Belgique (FAI)",
    id: "be_isp",
    category: "Europe",
    domains: [
      "proximus.be", "skynet.be", "telenet.be", "voo.be", "scarlet.be", "edpnet.be"
    ]
  },
  {
    name: "Allemagne (DE)",
    id: "de_isp",
    category: "Europe",
    domains: [
      "gmx.de", "web.de", "t-online.de", "freenet.de", "arcor.de", "vodafone.de", "kabelmail.de"
    ]
  },
  {
    name: "Royaume-Uni (UK)",
    id: "uk_isp",
    category: "Europe",
    domains: [
      "btinternet.com", "virginmedia.com", "sky.com", "talktalk.net", "blueyonder.co.uk", "ntlworld.com", "plus.com"
    ]
  },
  {
    name: "Italie (IT)",
    id: "it_isp",
    category: "Europe",
    domains: [
      "libero.it", "virgilio.it", "alice.it", "tin.it", "tiscali.it", "fastwebnet.it", "email.it"
    ]
  },
  {
    name: "Suisse (CH)",
    id: "ch_isp",
    category: "Europe",
    domains: [
      "bluewin.ch", "sunrise.ch", "hispeed.ch", "swissonline.ch", "infomaniak.com"
    ]
  },
  {
    name: "Pologne (PL)",
    id: "pl_isp",
    category: "Europe",
    domains: ["wp.pl", "onet.pl", "o2.pl", "interia.pl", "gazeta.pl"]
  },

  // ==========================================
  // 🇺🇸 AMÉRIQUE DU NORD (FAI USA/Canada)
  // ==========================================
  {
    name: "USA (ISP)",
    id: "us_isp",
    category: "North America",
    domains: [
      "comcast.net", "att.net", "sbcglobal.net", "bellsouth.net", "cox.net", 
      "charter.net", "earthlink.net", "optonline.net", "juno.com", "roadrunner.com", "windstream.net"
    ]
  },
  {
    name: "Canada (ISP)",
    id: "ca_isp",
    category: "North America",
    domains: ["shaw.ca", "rogers.com", "sympatico.ca", "telus.net", "videotron.ca"]
  },

  // ==========================================
  // 🇷🇺 RUSSIE & 🇨🇳 ASIE
  // ==========================================
  {
    name: "Russie (RuNet)",
    id: "ru_net",
    category: "Asia/Russia",
    domains: [
      "mail.ru", "yandex.ru", "ya.ru", "rambler.ru", "bk.ru", "inbox.ru", "list.ru"
    ]
  },
  {
    name: "Chine",
    id: "cn_net",
    category: "Asia/Russia",
    domains: [
      "qq.com", "163.com", "126.com", "sina.com", "aliyun.com", "foxmail.com", "sohu.com"
    ]
  },
  {
    name: "Corée & Japon",
    id: "kr_jp_net",
    category: "Asia/Russia",
    domains: [
      "naver.com", "daum.net", "hanmail.net", // Corée
      "docomo.ne.jp", "ezweb.ne.jp", "softbank.ne.jp" // Japon (Opérateurs)
    ]
  },

  // ==========================================
  // 🌎 LATAM & RESTE DU MONDE
  // ==========================================
  {
    name: "Brésil / LatAm",
    id: "latam_net",
    category: "South America",
    domains: [
      "uol.com.br", "bol.com.br", "terra.com.br", "ig.com.br", "globo.com"
    ]
  },
  {
    name: "Inde",
    id: "in_net",
    category: "Asia/Russia",
    domains: ["rediffmail.com"]
  }
];

// Helper : Retourne une liste plate de tous les domaines pour vérification rapide
export const ALL_KNOWN_DOMAINS = EMAIL_PROVIDERS.flatMap(provider => provider.domains);

// Helper pour obtenir une liste plate avec nom et domaine (pour l'affichage)
export interface ProviderDomain {
  domain: string;
  name: string;
  category: string;
  id?: string;
  icon?: string;
}

export const ALL_PROVIDERS_FLAT: ProviderDomain[] = EMAIL_PROVIDERS.flatMap(provider =>
  provider.domains.map(domain => ({
    domain,
    name: provider.name,
    category: provider.category,
    id: provider.id,
    icon: provider.icon
  }))
);

// Alias pour compatibilité avec l'ancien code
export const ALL_BLOCKED_DOMAINS_FLAT = ALL_KNOWN_DOMAINS;
