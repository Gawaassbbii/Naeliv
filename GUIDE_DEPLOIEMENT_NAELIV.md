# 🚀 Guide de Déploiement sur naeliv.com

Ce guide vous explique comment déployer votre application Next.js sur `naeliv.com` avec Vercel.

## 📋 Prérequis

- ✅ Compte GitHub (pour versionner le code)
- ✅ Compte Vercel (gratuit)
- ✅ Domaine `naeliv.com` configuré

---

## 🔧 Étape 1 : Préparer le Code

### 1.1 Vérifier que le code est prêt

Assurez-vous que :
- ✅ Le projet compile sans erreurs : `npm run build`
- ✅ Tous les fichiers sensibles sont dans `.gitignore` (`.env.local` ne doit PAS être commité)
- ✅ Les variables d'environnement sont documentées

### 1.2 Créer un dépôt GitHub (si pas déjà fait)

1. Allez sur [GitHub.com](https://github.com)
2. Créez un nouveau dépôt (ex: `naeliv-mail`)
3. **Important** : Ne cochez PAS "Add .gitignore" (vous en avez déjà un)

4. Dans votre terminal, exécutez :
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/VOTRE-USERNAME/naeliv-mail.git
git push -u origin main
```

---

## 🚀 Étape 2 : Déployer sur Vercel

### 2.1 Créer un compte Vercel

1. Allez sur [Vercel.com](https://vercel.com)
2. Créez un compte (gratuit) avec votre compte GitHub
3. Autorisez Vercel à accéder à vos dépôts GitHub

### 2.2 Importer le projet

1. Dans Vercel Dashboard, cliquez sur **"Add New"** > **"Project"**
2. Sélectionnez votre dépôt GitHub `naeliv-mail`
3. Vercel détectera automatiquement que c'est un projet Next.js

### 2.3 Configurer les Variables d'Environnement

**⚠️ CRITIQUE** : Ajoutez toutes vos variables d'environnement dans Vercel :

1. Dans la section **"Environment Variables"**, ajoutez :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://qmwcvaaviheclxgerdgq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key

# Webhook Secret
WEBHOOK_SECRET=whsec_1okDSlt2vHmmmZrSaHviDk3vX9kQgtei

# Resend
RESEND_API_KEY=votre_resend_api_key

# Sécurité
ALLOW_UNSIGNED_WEBHOOKS=false
NODE_ENV=production
```

2. **Important** : Cochez les environnements :
   - ✅ Production
   - ✅ Preview
   - ✅ Development

### 2.4 Déployer

1. Cliquez sur **"Deploy"**
2. Attendez que le déploiement se termine (2-3 minutes)
3. Vercel vous donnera une URL temporaire (ex: `naeliv-mail.vercel.app`)

---

## 🌐 Étape 3 : Configurer le Domaine naeliv.com

### 3.1 Ajouter le domaine dans Vercel

1. Dans votre projet Vercel, allez dans **Settings** > **Domains**
2. Cliquez sur **"Add Domain"**
3. Entrez : `naeliv.com`
4. Vercel vous donnera des instructions pour configurer les DNS

### 3.2 Configurer les DNS

Vercel vous donnera des enregistrements à ajouter dans votre registrar (là où vous avez acheté `naeliv.com`).

**Exemple d'enregistrements DNS :**

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**OU** (si Vercel utilise des CNAME) :

```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

**⚠️ Important** :
- Les valeurs exactes vous seront données par Vercel
- La propagation DNS peut prendre 24-48h
- Vérifiez dans Vercel que le domaine est "Valid" (coche verte)

### 3.3 Vérifier le SSL

Vercel configure automatiquement le SSL (HTTPS) pour votre domaine. Attendez quelques minutes après la configuration DNS.

---

## 📧 Étape 4 : Configurer Resend pour la Production

### 4.1 Mettre à jour le Webhook Resend

1. Allez dans **Resend Dashboard** > **Domains** > **naeliv.com**
2. Trouvez votre webhook
3. Modifiez l'URL de :
   - ❌ `https://interactive-tartly-nayeli.ngrok-free.dev/api/inbound-email` (ngrok local)
   
   Vers :
   - ✅ `https://naeliv.com/api/inbound-email` (production)

4. Vérifiez que le Secret est toujours : `whsec_1okDSlt2vHmmmZrSaHviDk3vX9kQgtei`
5. Sauvegardez

### 4.2 Tester

1. Envoyez un email depuis Gmail vers `test2@naeliv.com`
2. Vérifiez dans Resend Dashboard > Logs que le webhook est envoyé avec succès
3. Vérifiez dans Vercel Dashboard > Logs que l'API reçoit bien les requêtes
4. Vérifiez dans votre application `https://naeliv.com/mail` que l'email apparaît

---

## 🔒 Étape 5 : Sécurité en Production

### 5.1 Vérifications Finales

- [ ] `ALLOW_UNSIGNED_WEBHOOKS=false` dans Vercel
- [ ] `NODE_ENV=production` dans Vercel
- [ ] Toutes les variables d'environnement sont configurées
- [ ] Le domaine `naeliv.com` est bien configuré dans Vercel
- [ ] Le SSL (HTTPS) est actif
- [ ] Le webhook Resend pointe vers `https://naeliv.com/api/inbound-email`

### 5.2 Monitoring

- **Vercel Logs** : Allez dans votre projet > **Logs** pour voir les erreurs
- **Resend Logs** : Allez dans Resend Dashboard > **Logs** pour voir les webhooks
- **Supabase Logs** : Allez dans Supabase Dashboard > **Logs** pour voir les requêtes DB

---

## 🐛 Dépannage

### Problème : Le domaine ne se connecte pas

1. Vérifiez les DNS dans votre registrar
2. Utilisez [whatsmydns.net](https://www.whatsmydns.net) pour vérifier la propagation
3. Attendez 24-48h pour la propagation complète

### Problème : Les emails ne sont pas reçus

1. Vérifiez que le webhook Resend pointe vers `https://naeliv.com/api/inbound-email`
2. Vérifiez les logs Vercel pour les erreurs
3. Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est bien configuré dans Vercel
4. Vérifiez que le script SQL `permettre_insertion_emails_webhook.sql` a été exécuté dans Supabase

### Problème : Erreur 401 "Invalid signature"

1. Vérifiez que `WEBHOOK_SECRET` dans Vercel correspond exactement à celui dans Resend
2. Vérifiez que le secret dans Resend est bien `whsec_1okDSlt2vHmmmZrSaHviDk3vX9kQgtei`

---

## ✅ Checklist de Déploiement

- [ ] Code pushé sur GitHub
- [ ] Projet importé dans Vercel
- [ ] Toutes les variables d'environnement configurées dans Vercel
- [ ] Déploiement réussi sur Vercel
- [ ] Domaine `naeliv.com` ajouté dans Vercel
- [ ] DNS configurés dans le registrar
- [ ] Domaine vérifié dans Vercel (statut "Valid")
- [ ] SSL actif (HTTPS fonctionne)
- [ ] Webhook Resend mis à jour avec l'URL de production
- [ ] Test d'envoi d'email réussi
- [ ] Email visible dans l'application

---

## 📚 Ressources

- [Documentation Vercel - Domains](https://vercel.com/docs/concepts/projects/domains)
- [Documentation Vercel - Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Documentation Resend - Webhooks](https://resend.com/docs/dashboard/webhooks)

---

**Besoin d'aide ?** Vérifiez les logs Vercel et Resend pour identifier les problèmes.


