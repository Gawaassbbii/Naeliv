# Configuration de la Réception d'Emails

Pour recevoir des emails depuis des boîtes mail externes, vous devez configurer plusieurs éléments.

## 📋 Vue d'ensemble

1. **Configuration DNS** (obligatoire)
2. **Service de réception d'emails** (webhook/service)
3. **Endpoint API** pour traiter les emails reçus
4. **Stockage dans Supabase**

---

## 🔧 Option 1 : Resend (Recommandé - Simple)

Resend offre un service de réception d'emails (Inbound) très simple à configurer.

### Étape 1 : Créer un compte Resend
1. Allez sur [resend.com](https://resend.com)
2. Créez un compte
3. Obtenez votre API key

### Étape 2 : Configurer le domaine
1. Dans Resend Dashboard > Domains
2. Ajoutez `naeliv.com`
3. Suivez les instructions pour configurer les DNS

### Étape 3 : Configuration DNS requise

Ajoutez ces enregistrements DNS pour `naeliv.com` :

```
Type    Name    Value                           Priority
MX      @       feedback-smtp.resend.com        10
TXT     @       v=spf1 include:resend.com ~all
TXT     _dmarc  v=DMARC1; p=none; rua=mailto:dmarc@naeliv.com
```

### Étape 4 : Configurer Inbound Email
1. Dans Resend Dashboard > Inbound
2. Créez une route pour `*@naeliv.com`
3. Configurez l'URL du webhook : `https://votre-domaine.com/api/inbound-email`

### Étape 5 : Installer Resend SDK
```bash
npm install resend
```

---

## 🔧 Option 2 : Mailgun (Alternative)

Mailgun offre aussi un service de réception d'emails.

### Configuration
1. Créez un compte sur [mailgun.com](https://www.mailgun.com)
2. Ajoutez votre domaine
3. Configurez les DNS (MX, SPF, DKIM, DMARC)
4. Configurez les routes pour rediriger vers votre webhook

---

## 🔧 Option 3 : AWS SES + Lambda (Avancé)

Pour une solution plus personnalisée mais plus complexe.

### Configuration
1. Configurez AWS SES pour recevoir les emails
2. Créez une Lambda function pour traiter les emails
3. Configurez S3 pour stocker les emails bruts
4. Connectez Lambda à Supabase

---

## 📝 Création de l'Endpoint API

Créez un endpoint Next.js pour recevoir les emails :

**Fichier : `app/api/inbound-email/route.ts`**

Cet endpoint recevra les emails depuis Resend/Mailgun et les stockera dans Supabase.

---

## 🔐 Sécurité

- Vérifiez toujours la signature du webhook
- Utilisez des tokens secrets pour authentifier les requêtes
- Validez les données avant de les stocker

---

## 🧪 Test

Pour tester en développement :
1. Utilisez un service comme [Mailtrap](https://mailtrap.io) ou [Ethereal Email](https://ethereal.email)
2. Configurez un webhook local avec [ngrok](https://ngrok.com)
3. Envoyez un email de test

---

## 📚 Ressources

- [Resend Inbound Documentation](https://resend.com/docs/dashboard/inbound)
- [Mailgun Inbound Routes](https://documentation.mailgun.com/en/latest/user_manual.html#receiving-forwarding-and-storing-messages)
- [AWS SES Receiving Email](https://docs.aws.amazon.com/ses/latest/dg/receiving-email.html)

