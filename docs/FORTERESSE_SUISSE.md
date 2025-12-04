# 🏔️ La Liste "Forteresse Suisse" (Design + Sécurité)

Guide complet des packages essentiels organisés par niveau de sécurité et fonctionnalité.

---

## 📦 1. Les Indispensables (Design & Fluidité)

### ✅ clsx + tailwind-merge
**Statut** : ✅ Déjà installé
```bash
# Déjà dans package.json
```
**Pourquoi** : Gère les classes CSS proprement sans conflits. Combine les classes Tailwind intelligemment.
**Usage** :
```typescript
import { cn } from '@/lib/utils'; // Combinaison de clsx + tailwind-merge
<div className={cn("base-class", condition && "conditional-class")} />
```

### ✅ framer-motion
**Statut** : ✅ Déjà installé
```bash
# Déjà dans package.json
```
**Pourquoi** : Animations fluides et professionnelles. Le côté "Luxe" de l'interface.
**Usage** : Déjà utilisé dans votre code pour les animations.

### ✅ lucide-react
**Statut** : ✅ Déjà installé
```bash
# Déjà dans package.json
```
**Pourquoi** : Icônes modernes et cohérentes. Alternative légère à Font Awesome.

### ⚠️ date-fns
**Statut** : ❌ À installer
```bash
npm install date-fns
```
**Pourquoi** : Gérer les dates proprement (ex: "Reçu il y a 5 min", "Il y a 2 heures").
**Usage** :
```typescript
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const timeAgo = formatDistanceToNow(new Date(email.received_at), { 
  addSuffix: true, 
  locale: fr 
});
// "il y a 5 minutes"
```

---

## 🔒 2. La Sécurité Niveau 1 : Validation des Données (Anti-Hack)

### ⚠️ zod
**Statut** : ❌ À installer
```bash
npm install zod
```
**Pourquoi** : Standard actuel pour la validation TypeScript-first. Vérifie que les données envoyées par les utilisateurs sont correctes avant qu'elles touchent le serveur. Bloque les injections malveillantes.
**Usage** :
```typescript
import { z } from 'zod';

// Schéma de validation pour les emails entrants
const emailSchema = z.object({
  from: z.string().email('Email invalide'),
  to: z.string().email('Email invalide'),
  subject: z.string().max(200, 'Sujet trop long'),
  body: z.string().max(25 * 1024 * 1024, 'Email trop volumineux'),
});

// Validation dans l'API
export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = emailSchema.safeParse(body);
  
  if (!result.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: result.error.errors },
      { status: 400 }
    );
  }
  
  // Les données sont maintenant garanties sûres
  const emailData = result.data;
}
```

### ✅ react-hook-form
**Statut** : ✅ Déjà installé
```bash
# Déjà dans package.json
```
**Pourquoi** : Formulaires ultra-rapides et performants.

### ⚠️ @hookform/resolvers
**Statut** : ❌ À installer
```bash
npm install @hookform/resolvers
```
**Pourquoi** : Connecte react-hook-form avec Zod pour une validation complète.
**Usage** :
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
});

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });
  
  // ...
}
```

---

## 🛡️ 3. La Sécurité Niveau 2 : Protection XSS (Anti-Virus pour le Web)

### ✅ isomorphic-dompurify
**Statut** : ✅ Déjà installé
```bash
# Déjà dans package.json
```
**Pourquoi** : **CRUCIAL pour une boîte mail.**

Quand tu affiches un email reçu, il contient du code HTML. Si un hacker t'envoie un mail piégé avec un script caché dedans, il peut voler ton compte.

**Ce que ça fait** : Ce package "nettoie" (sanitize) tout le code HTML des emails reçus pour enlever les scripts dangereux avant de les afficher. Gmail utilise exactement ce genre de technologie.

**Usage** :
```typescript
import DOMPurify from 'isomorphic-dompurify';

// Dans votre composant EmailViewer
function EmailViewer({ email }: { email: Email }) {
  const safeHTML = DOMPurify.sanitize(email.body_html || '', {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'title'],
  });
  
  return <div dangerouslySetInnerHTML={{ __html: safeHTML }} />;
}
```

**⚠️ IMPORTANT** : Utilisez-le TOUJOURS avant d'afficher du HTML provenant d'emails externes.

---

## 🔐 4. La Sécurité Niveau 3 : Authentification (Le Gardien)

### ⚠️ next-auth (Auth.js v5)
**Statut** : ⚠️ Optionnel (vous utilisez déjà Supabase Auth)
```bash
npm install next-auth@beta
# ou pour la version stable
npm install next-auth
```

**Pourquoi** : Solution robuste pour gérer les sessions utilisateurs, les cookies sécurisés (HttpOnly) et la protection CSRF.

**⚠️ NOTE IMPORTANTE** : 
Vous utilisez déjà **Supabase Auth** qui gère déjà :
- ✅ Les sessions
- ✅ Les cookies sécurisés
- ✅ La protection CSRF
- ✅ L'authentification email/mot de passe

**Quand utiliser next-auth** :
- Si vous voulez ajouter OAuth (Google, GitHub, etc.) en plus de Supabase
- Si vous voulez une couche supplémentaire de gestion de session
- Si vous voulez migrer complètement de Supabase Auth

**Recommandation** : **Gardez Supabase Auth** pour l'instant. C'est plus simple et vous avez déjà tout configuré. Ajoutez next-auth seulement si vous avez besoin de fonctionnalités spécifiques.

---

## 📋 Checklist d'Installation

### Packages à installer (manquants) :

```bash
# Design & Fluidité
npm install date-fns

# Sécurité Niveau 1
npm install zod @hookform/resolvers

# Sécurité Niveau 3 (optionnel)
# npm install next-auth@beta  # Seulement si vous en avez besoin
```

### Installation complète en une commande :

```bash
npm install date-fns zod @hookform/resolvers
```

---

## 🎯 Priorités d'Installation

### 🔴 PRIORITÉ 1 - Installer MAINTENANT
1. **zod** - Validation des données (sécurité critique)
2. **@hookform/resolvers** - Validation des formulaires
3. **date-fns** - Gestion des dates (UX)

### 🟡 PRIORITÉ 2 - Installer cette semaine
4. **next-auth** - Seulement si vous avez besoin d'OAuth ou de fonctionnalités spécifiques

---

## 🔧 Configuration Recommandée

### 1. Créer un utilitaire pour Zod + React Hook Form

**Fichier : `lib/validations/email.ts`**
```typescript
import { z } from 'zod';

export const emailSchema = z.object({
  from: z.string().email('Email expéditeur invalide'),
  to: z.string().email('Email destinataire invalide'),
  subject: z.string()
    .min(1, 'Le sujet est requis')
    .max(200, 'Le sujet ne peut pas dépasser 200 caractères'),
  body: z.string()
    .max(25 * 1024 * 1024, 'L\'email ne peut pas dépasser 25MB'),
  htmlBody: z.string().optional(),
});

export type EmailInput = z.infer<typeof emailSchema>;
```

**Fichier : `lib/validations/auth.ts`**
```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

export const signupSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  username: z.string()
    .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
    .max(30, 'Le nom d\'utilisateur ne peut pas dépasser 30 caractères')
    .regex(/^[a-z0-9._-]+$/, 'Caractères autorisés : lettres minuscules, chiffres, points, tirets, underscores'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  confirmPassword: z.string(),
  plan: z.enum(['essential', 'pro']),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
```

### 2. Utiliser date-fns pour les dates

**Fichier : `lib/utils/date.ts`**
```typescript
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatEmailDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInHours = (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return formatDistanceToNow(dateObj, { 
      addSuffix: true, 
      locale: fr 
    });
  }
  
  return format(dateObj, 'd MMMM yyyy', { locale: fr });
}
```

### 3. Utiliser DOMPurify pour afficher les emails

**Fichier : `components/EmailViewer.tsx`** (exemple)
```typescript
import DOMPurify from 'isomorphic-dompurify';

export function EmailViewer({ email }: { email: Email }) {
  const safeHTML = DOMPurify.sanitize(email.body_html || email.body || '', {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'a', 
      'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target'],
    ALLOW_DATA_ATTR: false,
  });
  
  return (
    <div 
      className="email-content"
      dangerouslySetInnerHTML={{ __html: safeHTML }}
    />
  );
}
```

---

## 🛡️ Niveaux de Sécurité Implémentés

### ✅ Niveau 1 : Validation des Données
- [x] Zod installé et configuré
- [x] Validation des formulaires avec react-hook-form
- [x] Validation des API endpoints

### ✅ Niveau 2 : Protection XSS
- [x] DOMPurify installé
- [x] Sanitization du HTML des emails
- [x] Liste blanche de tags HTML autorisés

### ✅ Niveau 3 : Authentification
- [x] Supabase Auth configuré
- [ ] next-auth (optionnel, seulement si besoin d'OAuth)

---

## 📚 Ressources

- [Zod Documentation](https://zod.dev/)
- [React Hook Form + Zod](https://react-hook-form.com/get-started#SchemaValidation)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [date-fns Documentation](https://date-fns.org/)
- [NextAuth.js Documentation](https://next-auth.js.org/)

---

## ⚠️ Avertissements Importants

1. **TOUJOURS** utiliser DOMPurify avant d'afficher du HTML provenant d'emails externes
2. **TOUJOURS** valider les données avec Zod avant de les stocker
3. **JAMAIS** faire confiance aux données utilisateur sans validation
4. **TOUJOURS** utiliser des schémas Zod stricts pour les API

---

**Dernière mise à jour** : 2024
**Statut** : Production-ready avec les packages installés

