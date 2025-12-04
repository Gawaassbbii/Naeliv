/**
 * Rate Limiter simple en mémoire
 * Pour la production, utilisez Redis ou un service dédié
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Vérifie si une requête dépasse la limite de taux
 * @param identifier Identifiant unique (IP, email, etc.)
 * @param maxRequests Nombre maximum de requêtes
 * @param windowMs Fenêtre de temps en millisecondes
 * @returns true si la limite est dépassée
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute par défaut
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Nettoyer les entrées expirées périodiquement
  if (Math.random() < 0.01) {
    // 1% de chance de nettoyer (pour éviter de surcharger)
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }

  if (!entry || entry.resetTime < now) {
    // Nouvelle fenêtre ou fenêtre expirée
    const resetTime = now + windowMs;
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: resetTime,
    };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetTime,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetTime,
  };
}

/**
 * Nettoie les entrées expirées (à appeler périodiquement)
 */
export function cleanupRateLimit(): void {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

