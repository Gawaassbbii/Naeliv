import { z } from 'zod';

/**
 * Liste des noms d'utilisateurs réservés pour protéger l'identité de la marque Naeliv
 */
export const RESERVED_USERNAMES = [
  "admin", "administrator", "root", "system", "user", "guest",
  "webmaster", "hostmaster", "postmaster", "abuse", "security",
  "support", "help", "info", "contact", "hello", "hi",
  "sales", "marketing", "press", "media", "jobs", "hr",
  "billing", "invoice", "legal", "privacy",
  "noreply", "no-reply", "notifications", "bot", "mailer-daemon",
  "naeliv", "team", "staff", "official", "founder", "ceo", "cto",
  "api", "dev", "test"
];

/**
 * Schéma de validation pour la connexion
 */
export const loginSchema = z.object({
  email: z.string()
    .email('Email invalide')
    .min(1, 'L\'email est requis'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Le mot de passe ne peut pas dépasser 128 caractères'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Schéma de validation pour l'inscription
 */
export const signupSchema = z.object({
  firstName: z.string()
    .min(1, 'Le prénom est requis')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes'),
  lastName: z.string()
    .min(1, 'Le nom est requis')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'),
  username: z.string()
    .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
    .max(30, 'Le nom d\'utilisateur ne peut pas dépasser 30 caractères')
    .regex(/^[a-z0-9._-]+$/, 'Caractères autorisés : lettres minuscules, chiffres, points, tirets, underscores')
    .toLowerCase()
    .refine(
      (username) => !RESERVED_USERNAMES.includes(username.toLowerCase()),
      {
        message: 'Ce nom d\'utilisateur est réservé pour l\'équipe Naeliv. Veuillez en choisir un autre.',
      }
    ),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Le mot de passe ne peut pas dépasser 128 caractères'),
  confirmPassword: z.string(),
  plan: z.enum(['essential', 'pro'], {
    message: 'Le plan doit être "essential" ou "pro"',
  }),
})
.refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})
.refine((data) => {
  // Si le plan est Essential, le username doit contenir au moins un chiffre
  if (data.plan === 'essential') {
    return /[0-9]/.test(data.username);
  }
  // Pour PRO, pas de restriction
  return true;
}, {
  message: 'Pour le plan Essential, le nom d\'utilisateur doit contenir au moins un chiffre (ex: prenom123).',
  path: ['username'],
});

export type SignupInput = z.infer<typeof signupSchema>;

