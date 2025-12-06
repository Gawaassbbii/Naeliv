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
    name: "Gmail",
    id: "gmail",
    icon: "google",
    category: "Global",
    domains: ["gmail.com"]
  },
  {
    name: "Google Mail",
    id: "googlemail",
    icon: "google",
    category: "Global",
    domains: ["googlemail.com"]
  },
  {
    name: "Outlook",
    id: "outlook",
    icon: "microsoft",
    category: "Global",
    domains: ["outlook.com", "outlook.fr", "outlook.be", "outlook.de"]
  },
  {
    name: "Hotmail",
    id: "hotmail",
    icon: "microsoft",
    category: "Global",
    domains: ["hotmail.com", "hotmail.fr", "hotmail.be", "hotmail.co.uk", "hotmail.de", "hotmail.it", "hotmail.es"]
  },
  {
    name: "Live",
    id: "live",
    icon: "microsoft",
    category: "Global",
    domains: ["live.com", "live.fr", "live.be", "live.co.uk", "live.de", "live.it"]
  },
  {
    name: "MSN",
    id: "msn",
    icon: "microsoft",
    category: "Global",
    domains: ["msn.com", "msn.fr"]
  },
  {
    name: "Windows Live",
    id: "windowslive",
    category: "Global",
    domains: ["windowslive.com"]
  },
  {
    name: "Passport",
    id: "passport",
    category: "Global",
    domains: ["passport.com"]
  },
  {
    name: "Yahoo",
    id: "yahoo",
    icon: "yahoo",
    category: "Global",
    domains: ["yahoo.com", "yahoo.fr", "yahoo.be", "yahoo.co.uk", "yahoo.de", "yahoo.it", "yahoo.es", "yahoo.com.br", "yahoo.co.jp"]
  },
  {
    name: "YMail",
    id: "ymail",
    icon: "yahoo",
    category: "Global",
    domains: ["ymail.com"]
  },
  {
    name: "Rocketmail",
    id: "rocketmail",
    category: "Global",
    domains: ["rocketmail.com"]
  },
  {
    name: "AOL",
    id: "aol",
    category: "Global",
    domains: ["aol.com"]
  },
  {
    name: "AIM",
    id: "aim",
    category: "Global",
    domains: ["aim.com"]
  },
  {
    name: "Verizon",
    id: "verizon",
    category: "Global",
    domains: ["verizon.net"]
  },
  {
    name: "Apple iCloud",
    id: "icloud",
    icon: "apple",
    category: "Global",
    domains: ["icloud.com", "me.com", "mac.com"]
  },

  // ==========================================
  // 🛡️ SÉCURITÉ & VIE PRIVÉE (Tes concurrents)
  // ==========================================
  {
    name: "Proton Mail",
    id: "protonmail",
    category: "Privacy",
    domains: ["protonmail.com", "protonmail.ch"]
  },
  {
    name: "Proton",
    id: "proton",
    category: "Privacy",
    domains: ["proton.me"]
  },
  {
    name: "PM",
    id: "pm",
    category: "Privacy",
    domains: ["pm.me"]
  },
  {
    name: "Tutanota",
    id: "tutanota",
    category: "Privacy",
    domains: ["tutanota.com", "tutanota.de"]
  },
  {
    name: "Tuta",
    id: "tuta",
    category: "Privacy",
    domains: ["tuta.com", "tuta.io"]
  },
  {
    name: "TutaMail",
    id: "tutamail",
    category: "Privacy",
    domains: ["tutamail.com"]
  },
  {
    name: "Duck.com",
    id: "duck",
    category: "Privacy",
    domains: ["duck.com"]
  },
  {
    name: "Fastmail",
    id: "fastmail",
    category: "Privacy",
    domains: ["fastmail.com"]
  },
  {
    name: "Startmail",
    id: "startmail",
    category: "Privacy",
    domains: ["startmail.com"]
  },
  {
    name: "Mailbox.org",
    id: "mailbox",
    category: "Privacy",
    domains: ["mailbox.org"]
  },
  {
    name: "Posteo",
    id: "posteo",
    category: "Privacy",
    domains: ["posteo.de"]
  },
  {
    name: "Zoho",
    id: "zoho",
    category: "Privacy",
    domains: ["zoho.com"]
  },
  {
    name: "GMX",
    id: "gmx",
    category: "Privacy",
    domains: ["gmx.com", "gmx.de"]
  },
  {
    name: "Mail.com",
    id: "mailcom",
    category: "Privacy",
    domains: ["mail.com"]
  },
  {
    name: "Hushmail",
    id: "hushmail",
    category: "Privacy",
    domains: ["hushmail.com"]
  },
  {
    name: "Runbox",
    id: "runbox",
    category: "Privacy",
    domains: ["runbox.com"]
  },
  {
    name: "Countermail",
    id: "countermail",
    category: "Privacy",
    domains: ["countermail.com"]
  },

  // ==========================================
  // 🇪🇺 EUROPE (FAI & Historiques)
  // ==========================================
  {
    name: "Orange",
    id: "orange",
    category: "Europe",
    domains: ["orange.fr", "orange.be"]
  },
  {
    name: "Wanadoo",
    id: "wanadoo",
    category: "Europe",
    domains: ["wanadoo.fr"]
  },
  {
    name: "Free",
    id: "free",
    category: "Europe",
    domains: ["free.fr"]
  },
  {
    name: "SFR",
    id: "sfr",
    category: "Europe",
    domains: ["sfr.fr"]
  },
  {
    name: "Neuf",
    id: "neuf",
    category: "Europe",
    domains: ["neuf.fr"]
  },
  {
    name: "Bouygues Telecom (Bbox)",
    id: "bbox",
    category: "Europe",
    domains: ["bbox.fr"]
  },
  {
    name: "La Poste",
    id: "laposte",
    category: "Europe",
    domains: ["laposte.net"]
  },
  {
    name: "Club Internet",
    id: "clubinternet",
    category: "Europe",
    domains: ["club-internet.fr"]
  },
  {
    name: "Numericable",
    id: "numericable",
    category: "Europe",
    domains: ["numericable.fr"]
  },
  {
    name: "Noos",
    id: "noos",
    category: "Europe",
    domains: ["noos.fr"]
  },
  {
    name: "Alice ADSL",
    id: "aliceadsl",
    category: "Europe",
    domains: ["aliceadsl.fr"]
  },
  {
    name: "Voila",
    id: "voila",
    category: "Europe",
    domains: ["voila.fr"]
  },
  {
    name: "Libertysurf",
    id: "libertysurf",
    category: "Europe",
    domains: ["libertysurf.fr"]
  },
  {
    name: "Proximus",
    id: "proximus",
    category: "Europe",
    domains: ["proximus.be"]
  },
  {
    name: "Skynet",
    id: "skynet",
    category: "Europe",
    domains: ["skynet.be"]
  },
  {
    name: "Telenet",
    id: "telenet",
    category: "Europe",
    domains: ["telenet.be"]
  },
  {
    name: "Voo",
    id: "voo",
    category: "Europe",
    domains: ["voo.be"]
  },
  {
    name: "Scarlet",
    id: "scarlet",
    category: "Europe",
    domains: ["scarlet.be"]
  },
  {
    name: "EDPnet",
    id: "edpnet",
    category: "Europe",
    domains: ["edpnet.be"]
  },
  {
    name: "Web.de",
    id: "webde",
    category: "Europe",
    domains: ["web.de"]
  },
  {
    name: "T-Online",
    id: "tonline",
    category: "Europe",
    domains: ["t-online.de"]
  },
  {
    name: "Freenet",
    id: "freenet",
    category: "Europe",
    domains: ["freenet.de"]
  },
  {
    name: "Arcor",
    id: "arcor",
    category: "Europe",
    domains: ["arcor.de"]
  },
  {
    name: "Vodafone",
    id: "vodafone",
    category: "Europe",
    domains: ["vodafone.de"]
  },
  {
    name: "Kabelmail",
    id: "kabelmail",
    category: "Europe",
    domains: ["kabelmail.de"]
  },
  {
    name: "BT Internet",
    id: "btinternet",
    category: "Europe",
    domains: ["btinternet.com"]
  },
  {
    name: "Virgin Media",
    id: "virginmedia",
    category: "Europe",
    domains: ["virginmedia.com"]
  },
  {
    name: "Sky",
    id: "sky",
    category: "Europe",
    domains: ["sky.com"]
  },
  {
    name: "TalkTalk",
    id: "talktalk",
    category: "Europe",
    domains: ["talktalk.net"]
  },
  {
    name: "Blueyonder",
    id: "blueyonder",
    category: "Europe",
    domains: ["blueyonder.co.uk"]
  },
  {
    name: "NTL World",
    id: "ntlworld",
    category: "Europe",
    domains: ["ntlworld.com"]
  },
  {
    name: "Plus",
    id: "plus",
    category: "Europe",
    domains: ["plus.com"]
  },
  {
    name: "Libero",
    id: "libero",
    category: "Europe",
    domains: ["libero.it"]
  },
  {
    name: "Virgilio",
    id: "virgilio",
    category: "Europe",
    domains: ["virgilio.it"]
  },
  {
    name: "Alice",
    id: "alice",
    category: "Europe",
    domains: ["alice.it"]
  },
  {
    name: "Tin",
    id: "tin",
    category: "Europe",
    domains: ["tin.it"]
  },
  {
    name: "Tiscali",
    id: "tiscali",
    category: "Europe",
    domains: ["tiscali.it"]
  },
  {
    name: "Fastweb",
    id: "fastweb",
    category: "Europe",
    domains: ["fastwebnet.it"]
  },
  {
    name: "Email.it",
    id: "emailit",
    category: "Europe",
    domains: ["email.it"]
  },
  {
    name: "Bluewin",
    id: "bluewin",
    category: "Europe",
    domains: ["bluewin.ch"]
  },
  {
    name: "Sunrise",
    id: "sunrise",
    category: "Europe",
    domains: ["sunrise.ch"]
  },
  {
    name: "HiSpeed",
    id: "hispeed",
    category: "Europe",
    domains: ["hispeed.ch"]
  },
  {
    name: "Swiss Online",
    id: "swissonline",
    category: "Europe",
    domains: ["swissonline.ch"]
  },
  {
    name: "Infomaniak",
    id: "infomaniak",
    category: "Europe",
    domains: ["infomaniak.com"]
  },
  {
    name: "Wirtualna Polska",
    id: "wp",
    category: "Europe",
    domains: ["wp.pl"]
  },
  {
    name: "Onet",
    id: "onet",
    category: "Europe",
    domains: ["onet.pl"]
  },
  {
    name: "O2",
    id: "o2",
    category: "Europe",
    domains: ["o2.pl"]
  },
  {
    name: "Interia",
    id: "interia",
    category: "Europe",
    domains: ["interia.pl"]
  },
  {
    name: "Gazeta",
    id: "gazeta",
    category: "Europe",
    domains: ["gazeta.pl"]
  },

  // ==========================================
  // 🇺🇸 AMÉRIQUE DU NORD (FAI USA/Canada)
  // ==========================================
  {
    name: "Comcast",
    id: "comcast",
    category: "North America",
    domains: ["comcast.net"]
  },
  {
    name: "AT&T",
    id: "att",
    category: "North America",
    domains: ["att.net"]
  },
  {
    name: "SBC Global",
    id: "sbcglobal",
    category: "North America",
    domains: ["sbcglobal.net"]
  },
  {
    name: "BellSouth",
    id: "bellsouth",
    category: "North America",
    domains: ["bellsouth.net"]
  },
  {
    name: "Cox",
    id: "cox",
    category: "North America",
    domains: ["cox.net"]
  },
  {
    name: "Charter",
    id: "charter",
    category: "North America",
    domains: ["charter.net"]
  },
  {
    name: "EarthLink",
    id: "earthlink",
    category: "North America",
    domains: ["earthlink.net"]
  },
  {
    name: "Optimum Online",
    id: "optonline",
    category: "North America",
    domains: ["optonline.net"]
  },
  {
    name: "Juno",
    id: "juno",
    category: "North America",
    domains: ["juno.com"]
  },
  {
    name: "Road Runner",
    id: "roadrunner",
    category: "North America",
    domains: ["roadrunner.com"]
  },
  {
    name: "Windstream",
    id: "windstream",
    category: "North America",
    domains: ["windstream.net"]
  },
  {
    name: "Shaw",
    id: "shaw",
    category: "North America",
    domains: ["shaw.ca"]
  },
  {
    name: "Rogers",
    id: "rogers",
    category: "North America",
    domains: ["rogers.com"]
  },
  {
    name: "Sympatico",
    id: "sympatico",
    category: "North America",
    domains: ["sympatico.ca"]
  },
  {
    name: "Telus",
    id: "telus",
    category: "North America",
    domains: ["telus.net"]
  },
  {
    name: "Videotron",
    id: "videotron",
    category: "North America",
    domains: ["videotron.ca"]
  },

  // ==========================================
  // 🇷🇺 RUSSIE & 🇨🇳 ASIE
  // ==========================================
  {
    name: "Mail.ru",
    id: "mailru",
    category: "Asia/Russia",
    domains: ["mail.ru", "bk.ru", "inbox.ru", "list.ru"]
  },
  {
    name: "Yandex",
    id: "yandex",
    category: "Asia/Russia",
    domains: ["yandex.ru", "ya.ru"]
  },
  {
    name: "Rambler",
    id: "rambler",
    category: "Asia/Russia",
    domains: ["rambler.ru"]
  },
  {
    name: "QQ",
    id: "qq",
    category: "Asia/Russia",
    domains: ["qq.com"]
  },
  {
    name: "163",
    id: "163",
    category: "Asia/Russia",
    domains: ["163.com"]
  },
  {
    name: "126",
    id: "126",
    category: "Asia/Russia",
    domains: ["126.com"]
  },
  {
    name: "Sina",
    id: "sina",
    category: "Asia/Russia",
    domains: ["sina.com"]
  },
  {
    name: "Aliyun",
    id: "aliyun",
    category: "Asia/Russia",
    domains: ["aliyun.com"]
  },
  {
    name: "Foxmail",
    id: "foxmail",
    category: "Asia/Russia",
    domains: ["foxmail.com"]
  },
  {
    name: "Sohu",
    id: "sohu",
    category: "Asia/Russia",
    domains: ["sohu.com"]
  },
  {
    name: "Naver",
    id: "naver",
    category: "Asia/Russia",
    domains: ["naver.com"]
  },
  {
    name: "Daum",
    id: "daum",
    category: "Asia/Russia",
    domains: ["daum.net"]
  },
  {
    name: "Hanmail",
    id: "hanmail",
    category: "Asia/Russia",
    domains: ["hanmail.net"]
  },
  {
    name: "Docomo",
    id: "docomo",
    category: "Asia/Russia",
    domains: ["docomo.ne.jp"]
  },
  {
    name: "Ezweb",
    id: "ezweb",
    category: "Asia/Russia",
    domains: ["ezweb.ne.jp"]
  },
  {
    name: "Softbank",
    id: "softbank",
    category: "Asia/Russia",
    domains: ["softbank.ne.jp"]
  },

  // ==========================================
  // 🌎 LATAM & RESTE DU MONDE
  // ==========================================
  {
    name: "UOL",
    id: "uol",
    category: "South America",
    domains: ["uol.com.br"]
  },
  {
    name: "BOL",
    id: "bol",
    category: "South America",
    domains: ["bol.com.br"]
  },
  {
    name: "Terra",
    id: "terra",
    category: "South America",
    domains: ["terra.com.br"]
  },
  {
    name: "IG",
    id: "ig",
    category: "South America",
    domains: ["ig.com.br"]
  },
  {
    name: "Globo",
    id: "globo",
    category: "South America",
    domains: ["globo.com"]
  },
  {
    name: "Rediffmail",
    id: "rediffmail",
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
