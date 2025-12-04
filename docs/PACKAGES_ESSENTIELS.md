# 📦 Packages Essentiels - Priorité

## 🔴 PRIORITÉ 1 - CRITIQUES (Installer IMMÉDIATEMENT)

### 1. **resend** - Réception d'emails
```bash
npm install resend
```
**Pourquoi** : Service de réception d'emails (Inbound) - ESSENTIEL pour recevoir des emails
**Usage** : Configuration du webhook pour recevoir les emails entrants

### 2. **zod** - Validation de schémas
```bash
npm install zod
```
**Pourquoi** : Validation TypeScript-first, sécurité des données, validation des API
**Usage** : Valider toutes les données entrantes (formulaires, webhooks, API)
**Exemple** :
```typescript
import { z } from 'zod';
const emailSchema = z.object({
  from: z.string().email(),
  subject: z.string().max(200),
});
```

### 3. **@tanstack/react-query** - Gestion des données
```bash
npm install @tanstack/react-query
```
**Pourquoi** : Cache, synchronisation, gestion d'état serveur, optimisations
**Usage** : Remplacer les `useEffect` pour charger les emails, meilleures performances

---

## 🟠 PRIORITÉ 2 - TRÈS IMPORTANTS (Installer cette semaine)

### 4. **date-fns** - Manipulation de dates
```bash
npm install date-fns
```
**Pourquoi** : Formatage de dates, calculs, timezones - Plus léger que moment.js
**Usage** : Afficher "Il y a 2 heures", formater les dates d'emails

### 5. **ioredis** ou **@upstash/redis** - Rate limiting en production
```bash
# Option 1: Redis classique
npm install ioredis

# Option 2: Redis serverless (Upstash) - RECOMMANDÉ pour Vercel
npm install @upstash/redis
```
**Pourquoi** : Rate limiting distribué, cache, sessions - ESSENTIEL en production
**Usage** : Remplacer le rate limiter en mémoire par Redis

### 6. **bcryptjs** - Hachage de mots de passe
```bash
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```
**Pourquoi** : Sécurité des mots de passe (si vous gérez des mots de passe vous-même)
**Note** : Supabase gère déjà ça, mais utile pour d'autres cas

### 7. **winston** ou **pino** - Logs en production
```bash
# Option 1: Winston (plus populaire)
npm install winston

# Option 2: Pino (plus rapide)
npm install pino pino-pretty
```
**Pourquoi** : Logs structurés, rotation, niveaux - ESSENTIEL pour le monitoring
**Usage** : Remplacer les `console.log` par des logs professionnels

---

## 🟡 PRIORITÉ 3 - IMPORTANTS (Installer ce mois-ci)

### 8. **next-secure-headers** - Headers de sécurité
```bash
npm install next-secure-headers
```
**Pourquoi** : Headers de sécurité automatiques (CSP, HSTS, X-Frame-Options, etc.)
**Usage** : Protection contre XSS, clickjacking, etc.

### 9. **nodemailer** - Envoi d'emails (si besoin)
```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```
**Pourquoi** : Envoyer des emails (notifications, confirmations, etc.)
**Note** : Resend peut aussi envoyer, mais nodemailer est plus flexible

### 10. **sharp** - Optimisation d'images
```bash
npm install sharp
```
**Pourquoi** : Optimisation automatique des images Next.js - Performance
**Usage** : Next.js l'utilise automatiquement si installé

### 11. **react-error-boundary** - Gestion d'erreurs
```bash
npm install react-error-boundary
```
**Pourquoi** : Capturer les erreurs React, meilleure UX
**Usage** : Afficher des pages d'erreur élégantes

### 12. **@hookform/resolvers** - Validation de formulaires
```bash
npm install @hookform/resolvers
```
**Pourquoi** : Intégrer Zod avec react-hook-form (vous avez déjà react-hook-form)
**Usage** : Validation de formulaires avec Zod

---

## 🟢 PRIORITÉ 4 - UTILES (Installer selon besoins)

### 13. **recharts** - Graphiques
```bash
# Déjà installé ! ✅
```
**Pourquoi** : Graphiques et visualisations

### 14. **react-hot-toast** ou **sonner** - Notifications
```bash
# Vous avez déjà sonner ! ✅
```
**Pourquoi** : Notifications toast élégantes

### 15. **framer-motion** - Animations
```bash
# Déjà installé ! ✅
```
**Pourquoi** : Animations fluides

### 16. **react-markdown** - Markdown
```bash
npm install react-markdown remark-gfm
```
**Pourquoi** : Afficher le contenu markdown dans les emails

### 17. **react-pdf** - PDF
```bash
npm install react-pdf
```
**Pourquoi** : Afficher les PDFs dans les emails (pièces jointes)

### 18. **file-type** - Détection de type de fichier
```bash
npm install file-type
```
**Pourquoi** : Sécurité - Vérifier le type réel des fichiers uploadés

### 19. **helmet** - Headers de sécurité (alternative)
```bash
npm install helmet
```
**Pourquoi** : Alternative à next-secure-headers

### 20. **sentry** - Monitoring d'erreurs
```bash
npm install @sentry/nextjs
```
**Pourquoi** : Tracking d'erreurs en production, alertes

---

## 📋 Installation Rapide - Commandes

### Installation Complète (Priorités 1-3)
```bash
# Priorité 1
npm install resend zod @tanstack/react-query

# Priorité 2
npm install date-fns @upstash/redis bcryptjs winston

# Priorité 3
npm install next-secure-headers nodemailer sharp react-error-boundary @hookform/resolvers

# Types TypeScript
npm install --save-dev @types/bcryptjs @types/nodemailer
```

### Installation Minimale (Juste l'essentiel)
```bash
npm install resend zod @tanstack/react-query date-fns @upstash/redis
```

---

## 🎯 Packages Déjà Installés (Ne PAS réinstaller)

✅ **isomorphic-dompurify** - Sécurité HTML (déjà installé)
✅ **@supabase/supabase-js** - Base de données (déjà installé)
✅ **framer-motion** - Animations (déjà installé)
✅ **react-hook-form** - Formulaires (déjà installé)
✅ **lucide-react** - Icônes (déjà installé)
✅ **tailwind-merge** - Styles (déjà installé)

---

## 📊 Comparaison des Packages

### Rate Limiting
- **ioredis** : Redis classique, besoin d'un serveur Redis
- **@upstash/redis** : Redis serverless, gratuit jusqu'à 10k requêtes/jour, parfait pour Vercel

### Logs
- **winston** : Plus de plugins, plus populaire
- **pino** : Plus rapide, moins de dépendances

### Validation
- **zod** : TypeScript-first, très populaire
- **yup** : Alternative, mais Zod est meilleur pour TypeScript

---

## 🔧 Configuration Recommandée

### 1. Zod pour la validation
```typescript
// lib/validations/email.ts
import { z } from 'zod';

export const emailSchema = z.object({
  from: z.string().email(),
  to: z.string().email(),
  subject: z.string().max(200),
  body: z.string().max(25 * 1024 * 1024), // 25MB
});
```

### 2. React Query pour les emails
```typescript
// hooks/useEmails.ts
import { useQuery } from '@tanstack/react-query';

export function useEmails() {
  return useQuery({
    queryKey: ['emails'],
    queryFn: async () => {
      const { data } = await supabase.from('emails').select('*');
      return data;
    },
  });
}
```

### 3. Upstash Redis pour le rate limiting
```typescript
// lib/redis.ts
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
```

---

## ⚠️ Packages à ÉVITER

❌ **moment.js** - Trop lourd, utiliser date-fns
❌ **lodash** - Trop lourd, utiliser les fonctions natives ou des alternatives légères
❌ **axios** - Next.js fetch est suffisant
❌ **express** - Next.js a déjà son propre serveur

---

## 📈 Impact sur la Performance

| Package | Impact Performance | Taille |
|---------|-------------------|--------|
| zod | ⚡⚡⚡ Très léger | ~15KB |
| @tanstack/react-query | ⚡⚡⚡ Très léger | ~30KB |
| date-fns | ⚡⚡ Léger | ~70KB (tree-shakeable) |
| winston | ⚡⚡ Léger | ~50KB |
| @upstash/redis | ⚡⚡⚡ Très léger | ~10KB |

---

**Dernière mise à jour** : 2024
**Recommandation** : Installer au minimum les packages Priorité 1 et 2

