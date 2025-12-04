/**
 * Détection de spam basique
 * Pour la production, utilisez un service dédié comme SpamAssassin, Cloudflare Email Security, etc.
 */

interface SpamScore {
  score: number;
  reasons: string[];
  isSpam: boolean;
}

/**
 * Analyse un email pour détecter le spam
 */
export function detectSpam(emailData: {
  fromEmail: string;
  fromName?: string;
  subject: string;
  textBody?: string;
  htmlBody?: string;
}): SpamScore {
  const reasons: string[] = [];
  let score = 0;

  const subject = (emailData.subject || '').toLowerCase();
  const textBody = (emailData.textBody || '').toLowerCase();
  const htmlBody = (emailData.htmlBody || '').toLowerCase();
  const fromEmail = (emailData.fromEmail || '').toLowerCase();

  // Mots-clés de spam courants
  const spamKeywords = [
    'viagra', 'cialis', 'casino', 'lottery', 'winner', 'prize',
    'click here', 'act now', 'limited time', 'urgent', 'free money',
    'nigerian prince', 'inheritance', 'lottery winner',
  ];

  // Vérifier le sujet
  for (const keyword of spamKeywords) {
    if (subject.includes(keyword)) {
      score += 2;
      reasons.push(`Sujet contient un mot-clé suspect: ${keyword}`);
    }
  }

  // Vérifier le corps
  for (const keyword of spamKeywords) {
    if (textBody.includes(keyword) || htmlBody.includes(keyword)) {
      score += 1;
      if (!reasons.some(r => r.includes(keyword))) {
        reasons.push(`Corps contient un mot-clé suspect: ${keyword}`);
      }
    }
  }

  // Vérifier les URLs suspectes
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = [...(textBody.match(urlRegex) || []), ...(htmlBody.match(urlRegex) || [])];
  
  if (urls.length > 5) {
    score += 2;
    reasons.push('Trop d\'URLs dans l\'email');
  }

  // Vérifier les domaines suspects
  const suspiciousDomains = [
    '.tk', '.ml', '.ga', '.cf', '.gq', // Domaines gratuits souvent utilisés pour le spam
  ];
  
  for (const domain of suspiciousDomains) {
    if (fromEmail.includes(domain)) {
      score += 1;
      reasons.push(`Domaine suspect: ${domain}`);
    }
  }

  // Vérifier les caractères répétitifs (ex: "!!!!!!" ou "AAAAA")
  if (subject.match(/(.)\1{4,}/)) {
    score += 1;
    reasons.push('Caractères répétitifs dans le sujet');
  }

  // Vérifier la proportion de majuscules (SPAM en majuscules)
  const uppercaseRatio = (subject.match(/[A-Z]/g) || []).length / (subject.length || 1);
  if (uppercaseRatio > 0.7 && subject.length > 10) {
    score += 1;
    reasons.push('Trop de majuscules dans le sujet');
  }

  // Vérifier la longueur suspecte
  if (subject.length > 100) {
    score += 1;
    reasons.push('Sujet anormalement long');
  }

  // Vérifier les liens suspects (bit.ly, tinyurl, etc.)
  const shortenerDomains = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly'];
  for (const domain of shortenerDomains) {
    if (textBody.includes(domain) || htmlBody.includes(domain)) {
      score += 1;
      reasons.push(`URL raccourcie suspecte: ${domain}`);
    }
  }

  // Score >= 5 = spam probable
  const isSpam = score >= 5;

  return {
    score,
    reasons,
    isSpam,
  };
}

/**
 * Vérifie si l'expéditeur est dans une liste noire (blacklist)
 */
export function isBlacklisted(email: string, blacklist: string[] = []): boolean {
  const emailLower = email.toLowerCase();
  return blacklist.some(blocked => emailLower.includes(blocked.toLowerCase()));
}

/**
 * Vérifie si l'expéditeur est dans une liste blanche (whitelist)
 */
export function isWhitelisted(email: string, whitelist: string[] = []): boolean {
  const emailLower = email.toLowerCase();
  return whitelist.some(allowed => emailLower.includes(allowed.toLowerCase()));
}

