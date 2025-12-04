import { z } from 'zod';

/**
 * Schéma de validation pour les emails entrants (webhook)
 */
export const inboundEmailSchema = z.object({
  from: z.string().email('Email expéditeur invalide'),
  to: z.string().email('Email destinataire invalide'),
  subject: z.string()
    .min(1, 'Le sujet est requis')
    .max(200, 'Le sujet ne peut pas dépasser 200 caractères'),
  body: z.string()
    .max(25 * 1024 * 1024, 'L\'email ne peut pas dépasser 25MB'),
  htmlBody: z.string().optional(),
  fromName: z.string().optional(),
});

export type InboundEmailInput = z.infer<typeof inboundEmailSchema>;

/**
 * Schéma de validation pour l'envoi d'emails
 */
export const sendEmailSchema = z.object({
  to: z.string().email('Email destinataire invalide'),
  subject: z.string()
    .min(1, 'Le sujet est requis')
    .max(200, 'Le sujet ne peut pas dépasser 200 caractères'),
  body: z.string()
    .min(1, 'Le corps de l\'email est requis')
    .max(25 * 1024 * 1024, 'L\'email ne peut pas dépasser 25MB'),
  htmlBody: z.string().optional(),
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;

