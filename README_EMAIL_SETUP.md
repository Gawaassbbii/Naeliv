# 📧 Configuration de la Réception d'Emails

Ce guide vous explique comment configurer la réception d'emails depuis des boîtes mail externes.

## 🎯 Objectif

Permettre à vos utilisateurs de recevoir des emails envoyés depuis Gmail, Outlook, Yahoo, etc. vers leurs adresses `@naeliv.com`.

---

## 🚀 Solution Recommandée : Resend Inbound

### Étape 1 : Installer Resend

```bash
npm install resend
```

### Étape 2 : Créer un compte Resend

1. Allez sur [resend.com](https://resend.com)
2. Créez un compte gratuit
3. Obtenez votre API key dans le dashboard

### Étape 3 : Configurer votre domaine

1. Dans Resend Dashboard, allez dans **Domains**
2. Cliquez sur **Add Domain**
3. Entrez `naeliv.com`
4. Resend vous donnera des enregistrements DNS à ajouter

### Étape 4 : Configuration DNS

Ajoutez ces enregistrements dans votre gestionnaire DNS (chez votre registrar) :

```
Type    Name    Value                           Priority
MX      @       feedback-smtp.resend.com        10
TXT     @       v=spf1 include:resend.com ~all
TXT     _dmarc  v=DMARC1; p=none; rua=mailto:dmarc@naeliv.com
```

**Important** : La propagation DNS peut prendre jusqu'à 48h.

### Étape 5 : Configurer Inbound Email

1. Dans Resend Dashboard, allez dans **Inbound**
2. Cliquez sur **Create Route**
3. Configurez :
   - **Pattern** : `*@naeliv.com` (pour recevoir tous les emails)
   - **Webhook URL** : `https://votre-domaine.com/api/inbound-email`
   - Activez la route

### Étape 6 : Variables d'environnement

Ajoutez dans votre `.env.local` :

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
WEBHOOK_SECRET=your_random_secret_key_here
```

### Étape 7 : Déployer l'endpoint

L'endpoint `/api/inbound-email` est déjà créé dans `app/api/inbound-email/route.ts`.

Déployez votre application Next.js (Vercel, Netlify, etc.) et mettez à jour l'URL du webhook dans Resend.

---

## 🧪 Tester la Réception

### Option 1 : Test avec un email réel

1. Envoyez un email depuis Gmail/Outlook vers `test@naeliv.com`
2. Vérifiez dans Supabase que l'email apparaît dans la table `emails`
3. Vérifiez dans votre application que l'email s'affiche

### Option 2 : Test avec le script

```bash
node scripts/test-inbound-email.js
```

### Option 3 : Test avec curl

```bash
curl -X POST http://localhost:3000/api/inbound-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "email.received",
    "data": {
      "from": "test@example.com",
      "to": "user@naeliv.com",
      "subject": "Test Email",
      "text": "This is a test"
    }
  }'
```

---

## 🔐 Sécurité

### Valider les signatures de webhook

Ajoutez la validation dans `app/api/inbound-email/route.ts` :

```typescript
import crypto from 'crypto';

function verifyResendSignature(body: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(body).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}
```

---

## 🔄 Alternatives

### Mailgun

1. Créez un compte sur [mailgun.com](https://www.mailgun.com)
2. Ajoutez votre domaine
3. Configurez les routes pour rediriger vers `/api/inbound-email`
4. L'endpoint est compatible avec le format Mailgun

### AWS SES

Plus complexe mais plus flexible. Voir la documentation AWS SES pour la configuration.

---

## 📊 Vérification

Pour vérifier que tout fonctionne :

1. ✅ Les enregistrements DNS sont configurés
2. ✅ Le domaine est vérifié dans Resend
3. ✅ La route Inbound est active
4. ✅ L'endpoint API répond (testez avec GET `/api/inbound-email`)
5. ✅ Les emails apparaissent dans Supabase après envoi

---

## 🐛 Dépannage

### Les emails ne sont pas reçus

1. Vérifiez les logs Resend Dashboard > Logs
2. Vérifiez que l'endpoint répond (GET `/api/inbound-email`)
3. Vérifiez les logs de votre serveur
4. Vérifiez que le domaine est bien vérifié

### Erreur 404 dans Resend

- Vérifiez que l'URL du webhook est correcte
- Vérifiez que votre application est déployée et accessible
- Testez l'endpoint manuellement

### Les emails ne s'affichent pas

1. Vérifiez dans Supabase que les emails sont bien stockés
2. Vérifiez que `user_id` correspond bien à un utilisateur existant
3. Vérifiez les logs de l'application

---

## 📚 Ressources

- [Resend Inbound Documentation](https://resend.com/docs/dashboard/inbound)
- [Resend API Reference](https://resend.com/docs/api-reference)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

## ✅ Checklist de Déploiement

- [ ] Compte Resend créé
- [ ] Domaine `naeliv.com` ajouté dans Resend
- [ ] Enregistrements DNS configurés
- [ ] Domaine vérifié dans Resend
- [ ] Route Inbound créée
- [ ] Webhook URL configurée
- [ ] Variables d'environnement configurées
- [ ] Application déployée
- [ ] Test d'envoi d'email réussi
- [ ] Emails visibles dans l'application

