# 📧 Guide de Configuration - Réception d'Emails pour naeliv.com

Ce guide vous explique comment configurer la réception d'emails pour votre domaine `naeliv.com` avec Mailgun.

## 🎯 Objectif

Configurer Mailgun pour que tous les emails envoyés à `*@naeliv.com` soient automatiquement transférés à votre API `/api/inbound-email`.

---

## 📋 Étape 1 : Créer un compte Mailgun

1. Allez sur [Mailgun.com](https://www.mailgun.com)
2. Créez un compte (gratuit jusqu'à 5000 emails/mois)
3. Vérifiez votre email

---

## 📋 Étape 2 : Ajouter et Vérifier votre Domaine

1. Dans le dashboard Mailgun, allez dans **Sending** > **Domains**
2. Cliquez sur **Add New Domain**
3. Entrez : `naeliv.com`
4. Sélectionnez **US** ou **EU** (selon votre région)
5. Cliquez sur **Add Domain**

### 2.1 Vérifier le Domaine

Mailgun vous donnera des enregistrements DNS à ajouter. Vous devez ajouter ces enregistrements dans votre registrar (là où vous avez acheté `naeliv.com`).

**Exemple d'enregistrements à ajouter :**

```
Type: TXT
Name: @
Value: v=spf1 include:mailgun.org ~all

Type: TXT
Name: mailo._domainkey
Value: k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...

Type: CNAME
Name: email
Value: mailgun.org

Type: MX
Name: @
Priority: 10
Value: mxa.mailgun.org

Type: MX
Name: @
Priority: 10
Value: mxb.mailgun.org
```

**⚠️ Important :**
- Les valeurs exactes vous seront données par Mailgun
- La propagation DNS peut prendre 24-48h
- Vérifiez dans Mailgun que le domaine est "Verified" (coche verte)

---

## 📋 Étape 3 : Configurer la Route Inbound (Réception d'Emails)

1. Dans Mailgun Dashboard, allez dans **Receiving** > **Routes**
2. Cliquez sur **Create Route**
3. Configurez la route :

### Configuration de la Route :

**Expression de Filtre :**
```
match_recipient(".*@naeliv.com")
```
Cela capture tous les emails envoyés à n'importe quelle adresse `@naeliv.com`.

**Action :**
- Sélectionnez **Forward**
- URL : `https://votre-domaine.com/api/inbound-email`
  - Remplacez `votre-domaine.com` par votre domaine de production
  - Exemple : `https://naeliv.com/api/inbound-email`
  - Ou si vous êtes sur Vercel : `https://votre-app.vercel.app/api/inbound-email`

**Priorité :** Laissez par défaut (0)

4. Cliquez sur **Create Route**

---

## 📋 Étape 4 : Configurer les Variables d'Environnement

Dans votre fichier `.env.local`, ajoutez :

```env
# Mailgun (pour la réception d'emails)
MAILGUN_API_KEY=votre_mailgun_api_key
MAILGUN_DOMAIN=naeliv.com

# Webhook Secret (pour sécuriser les webhooks)
WEBHOOK_SECRET=votre_secret_aleatoire_32_caracteres_minimum
```

### 4.1 Obtenir la Clé API Mailgun

1. Dans Mailgun Dashboard, allez dans **Settings** > **API Keys**
2. Copiez la **Private API key** (commence par `key-`)
3. Ajoutez-la dans `.env.local` comme `MAILGUN_API_KEY`

---

## 📋 Étape 5 : Tester la Configuration

### 5.1 Test Local (avec ngrok)

Si vous voulez tester en local :

1. Installez [ngrok](https://ngrok.com/)
2. Démarrez votre serveur Next.js : `npm run dev`
3. Dans un autre terminal, lancez : `ngrok http 3000`
4. Copiez l'URL ngrok (ex: `https://abc123.ngrok.io`)
5. Dans Mailgun, modifiez la route pour utiliser : `https://abc123.ngrok.io/api/inbound-email`
6. Envoyez un email de test à `test@naeliv.com`
7. Vérifiez les logs de votre serveur Next.js

### 5.2 Test en Production

1. Déployez votre application (Vercel, Netlify, etc.)
2. Configurez la route Mailgun avec votre URL de production
3. Envoyez un email de test à `votre-username@naeliv.com`
4. Vérifiez que l'email apparaît dans `/mail` de votre application

---

## 🔒 Sécurité

### Vérification de Signature

Votre API vérifie automatiquement la signature des webhooks Mailgun grâce à :
- `MAILGUN_API_KEY` dans `.env.local`
- Le header `x-mailgun-signature` envoyé par Mailgun

**⚠️ Important :** Ne partagez jamais votre `MAILGUN_API_KEY` publiquement !

---

## 🐛 Dépannage

### Problème : Les emails n'arrivent pas

1. **Vérifiez la route Mailgun :**
   - Allez dans **Receiving** > **Routes**
   - Vérifiez que la route est active (statut "Active")
   - Vérifiez l'URL de destination

2. **Vérifiez les logs Mailgun :**
   - Allez dans **Logs** > **Events**
   - Cherchez les événements "accepted" ou "failed"
   - Vérifiez les erreurs

3. **Vérifiez votre API :**
   - Regardez les logs de votre serveur Next.js
   - Vérifiez que l'endpoint `/api/inbound-email` répond
   - Vérifiez les erreurs dans la console

4. **Vérifiez les DNS :**
   - Utilisez [MXToolbox](https://mxtoolbox.com/) pour vérifier vos enregistrements MX
   - Vérifiez que les enregistrements DNS sont correctement propagés

### Problème : "Invalid signature"

1. Vérifiez que `MAILGUN_API_KEY` est correct dans `.env.local`
2. Vérifiez que vous utilisez la **Private API key** (pas la Public key)
3. Redémarrez votre serveur après avoir modifié `.env.local`

---

## ✅ Checklist de Vérification

- [ ] Compte Mailgun créé
- [ ] Domaine `naeliv.com` ajouté dans Mailgun
- [ ] Enregistrements DNS ajoutés dans votre registrar
- [ ] Domaine vérifié dans Mailgun (statut "Verified")
- [ ] Route inbound créée avec l'expression `match_recipient(".*@naeliv.com")`
- [ ] URL de destination configurée (votre API `/api/inbound-email`)
- [ ] `MAILGUN_API_KEY` ajouté dans `.env.local`
- [ ] `MAILGUN_DOMAIN=naeliv.com` ajouté dans `.env.local`
- [ ] `WEBHOOK_SECRET` configuré dans `.env.local`
- [ ] Test d'envoi d'email réussi
- [ ] Email visible dans l'interface `/mail`

---

## 📚 Ressources

- [Documentation Mailgun - Receiving](https://documentation.mailgun.com/en/latest/user_manual.html#receiving-messages)
- [Documentation Mailgun - Routes](https://documentation.mailgun.com/en/latest/user_manual.html#receiving-routes)
- [Documentation Mailgun - Domain Verification](https://documentation.mailgun.com/en/latest/user_manual.html#verifying-your-domain)

---

**Besoin d'aide ?** Vérifiez les logs Mailgun et les logs de votre serveur pour identifier le problème.

