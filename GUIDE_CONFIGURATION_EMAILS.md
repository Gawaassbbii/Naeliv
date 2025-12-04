# 📧 Guide de Configuration des Emails

Ce guide vous explique comment rendre les emails fonctionnels dans votre application Naeliv.

## 📋 Prérequis

1. ✅ Base de données Supabase configurée
2. ✅ Tables créées (`emails`, `profiles`, `contacts`)
3. ✅ Politiques RLS configurées
4. ✅ Endpoint API `/api/inbound-email` créé

## 🔧 Étapes de Configuration

### 1. Exécuter les Scripts SQL dans Supabase

#### 1.1 Schéma de base de données
Exécutez dans l'éditeur SQL de Supabase :
```sql
-- Fichier: executer dans sql/supabase_schema.sql
```
Ce script crée toutes les tables nécessaires avec les bonnes colonnes.

#### 1.2 Fonction pour l'insertion d'emails via webhook
Exécutez dans l'éditeur SQL de Supabase :
```sql
-- Fichier: executer dans sql/permettre_insertion_emails_webhook.sql
```
Ce script crée une fonction PostgreSQL qui permet à l'API webhook d'insérer des emails même avec RLS activé.

### 2. Configurer les Variables d'Environnement

Ajoutez dans votre fichier `.env.local` :

```env
# Supabase (déjà configuré normalement)
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key

# IMPORTANT: Service Role Key pour l'API webhook
# Trouvez-la dans Supabase > Settings > API > service_role key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key

# Sécurité Webhook (obligatoire pour la production)
# Générez une clé secrète aléatoire (minimum 32 caractères)
WEBHOOK_SECRET=votre_secret_aleatoire_min_32_caracteres

# Service Email (choisissez un des deux)
# Option 1: Resend
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Option 2: Mailgun
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=votre-domaine.com

# Sécurité (optionnel)
EMAIL_BLACKLIST=spam@example.com,bad@example.com
ALLOW_UNSIGNED_WEBHOOKS=false  # Toujours false en production !
```

### 3. Configurer un Service de Réception d'Emails

Vous avez plusieurs options pour recevoir des emails :

#### Option A: Resend (Recommandé - Simple)

1. Créez un compte sur [Resend.com](https://resend.com)
2. Vérifiez votre domaine `@naeliv.com`
3. Configurez le webhook :
   - URL: `https://votre-domaine.com/api/inbound-email`
   - Secret: La même valeur que `WEBHOOK_SECRET` dans `.env.local`
4. Activez la réception d'emails pour votre domaine

#### Option B: Mailgun

1. Créez un compte sur [Mailgun.com](https://www.mailgun.com)
2. Vérifiez votre domaine `@naeliv.com`
3. Configurez les routes :
   - URL: `https://votre-domaine.com/api/inbound-email`
   - Méthode: POST
4. Configurez les webhooks dans Mailgun

#### Option C: SendGrid

1. Créez un compte sur [SendGrid.com](https://sendgrid.com)
2. Vérifiez votre domaine
3. Configurez l'Inbound Parse Webhook :
   - URL: `https://votre-domaine.com/api/inbound-email`
   - Méthode: POST

### 4. Tester la Configuration

#### 4.1 Tester l'endpoint API localement

Utilisez `curl` ou Postman pour tester :

```bash
curl -X POST http://localhost:3000/api/inbound-email \
  -H "Content-Type: application/json" \
  -H "x-resend-signature: test" \
  -d '{
    "from": "test@example.com",
    "to": "username@naeliv.com",
    "subject": "Test Email",
    "text": "Test body"
  }'
```

#### 4.2 Vérifier dans Supabase

1. Allez dans Supabase > Table Editor > `emails`
2. Vérifiez qu'un nouvel email a été créé
3. Vérifiez que `user_id` correspond à l'utilisateur correct

#### 4.3 Tester avec un vrai email

1. Envoyez un email à `votre-username@naeliv.com`
2. Attendez quelques secondes
3. Rafraîchissez la page `/mail` dans votre application
4. L'email devrait apparaître dans la boîte de réception

## 🔒 Sécurité

### Points Importants

1. **Service Role Key** : 
   - ⚠️ **NE JAMAIS** exposer cette clé côté client
   - ⚠️ Utilisez-la **UNIQUEMENT** dans les routes API serveur
   - ⚠️ Ajoutez-la dans `.env.local` (pas dans `.env` qui pourrait être commité)

2. **Webhook Secret** :
   - ✅ Utilisez une clé aléatoire forte (minimum 32 caractères)
   - ✅ Changez-la régulièrement
   - ✅ Ne la partagez jamais publiquement

3. **Rate Limiting** :
   - ✅ Déjà implémenté dans l'API (100 emails/minute par IP)
   - ✅ Ajustez selon vos besoins

## 🐛 Dépannage

### Problème: "Error storing email" dans les logs

**Solution 1**: Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est configuré
```bash
# Vérifiez dans .env.local
echo $SUPABASE_SERVICE_ROLE_KEY
```

**Solution 2**: Vérifiez que la fonction PostgreSQL existe
```sql
-- Dans Supabase SQL Editor
SELECT proname FROM pg_proc WHERE proname = 'insert_email_via_webhook';
```

**Solution 3**: Vérifiez les politiques RLS
```sql
-- Dans Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'emails';
```

### Problème: Les emails n'apparaissent pas dans l'interface

1. Vérifiez la console du navigateur pour les erreurs
2. Vérifiez les logs serveur (terminal où `npm run dev` tourne)
3. Vérifiez dans Supabase que les emails sont bien créés
4. Vérifiez que `user_id` correspond bien à votre utilisateur connecté

### Problème: "Invalid signature" dans les logs

1. Vérifiez que `WEBHOOK_SECRET` correspond à celui configuré dans votre service email
2. Vérifiez que le header de signature est correct (Resend: `x-resend-signature`, Mailgun: `x-mailgun-signature`)

## 📚 Ressources

- [Documentation Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Documentation Resend Webhooks](https://resend.com/docs/webhooks)
- [Documentation Mailgun Routes](https://documentation.mailgun.com/en/latest/user_manual.html#receiving-messages)

## ✅ Checklist de Vérification

- [ ] Scripts SQL exécutés dans Supabase
- [ ] Variables d'environnement configurées (`.env.local`)
- [ ] Service email configuré (Resend/Mailgun/SendGrid)
- [ ] Webhook configuré dans le service email
- [ ] Test d'envoi d'email réussi
- [ ] Email visible dans l'interface `/mail`
- [ ] Logs serveur sans erreurs

---

**Besoin d'aide ?** Vérifiez les logs serveur et la console du navigateur pour plus de détails.

