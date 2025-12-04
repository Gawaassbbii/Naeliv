# 🧪 Tester la Réception d'Emails en Local

## Problème

Quand vous envoyez un email depuis Gmail vers `test2@naeliv.com` :
1. ✅ Gmail envoie l'email à Resend
2. ✅ Resend reçoit l'email
3. ❌ Resend essaie d'envoyer un webhook vers `localhost:3000` → **IMPOSSIBLE** (Resend ne peut pas accéder à votre machine locale)

## Solution : Utiliser ngrok (Tunnel)

### Étape 1 : Installer ngrok

1. Allez sur https://ngrok.com/
2. Créez un compte gratuit
3. Téléchargez ngrok pour Windows
4. Extrayez l'exécutable dans un dossier (ex: `C:\ngrok\`)

### Étape 2 : Obtenir votre token d'authentification

1. Connectez-vous sur https://dashboard.ngrok.com/
2. Allez dans **Your Authtoken**
3. Copiez votre token

### Étape 3 : Configurer ngrok

1. Ouvrez PowerShell ou CMD
2. Naviguez vers le dossier ngrok : `cd C:\ngrok` (ou votre dossier)
3. Authentifiez : `.\ngrok.exe authtoken VOTRE_TOKEN`
4. Démarrez le tunnel : `.\ngrok.exe http 3000`

Vous verrez quelque chose comme :
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

### Étape 4 : Configurer le Webhook dans Resend

1. Allez dans **Resend Dashboard** > **Domains** > **naeliv.com**
2. Trouvez la section **Webhooks** ou **Inbound Email**
3. Configurez :
   - **URL** : `https://abc123.ngrok.io/api/inbound-email` (remplacez par votre URL ngrok)
   - **Secret** : `whsec_1okDSlt2vHmmmZrSaHviDk3vX9kQgtei` (votre WEBHOOK_SECRET)
   - **Events** : `email.received`

### Étape 5 : Tester

1. **Gardez ngrok ouvert** (le tunnel doit rester actif)
2. **Gardez votre serveur Next.js ouvert** (`npm run dev`)
3. **Envoyez un email** depuis Gmail vers `test2@naeliv.com`
4. **Regardez les logs** dans votre terminal Next.js
5. **Regardez les logs** dans ngrok (vous verrez les requêtes)

### Étape 6 : Vérifier

1. Dans votre terminal Next.js, vous devriez voir :
   ```
   📧 [INBOUND EMAIL] Requête reçue à ...
   📧 [INBOUND EMAIL] Body parsé: ...
   ✅ Email received and stored: ...
   ```

2. Dans ngrok, vous verrez :
   ```
   POST /api/inbound-email    200 OK
   ```

3. Dans votre application, allez sur `http://localhost:3000/mail` et l'email devrait apparaître

---

## Alternative : Tester en Production

Si vous ne voulez pas utiliser ngrok, vous pouvez :

1. **Déployer votre application** (Vercel, Netlify, etc.)
2. **Configurer le webhook Resend** avec votre URL de production
3. **Tester** en envoyant un email

**Avantage** : Pas besoin de tunnel
**Inconvénient** : Vous devez déployer à chaque changement pour tester

---

## Dépannage

### ngrok se ferme après quelques minutes

C'est normal avec le plan gratuit. Redémarrez simplement ngrok.

### L'URL ngrok change à chaque redémarrage

C'est normal. Vous devrez mettre à jour l'URL dans Resend à chaque fois.

**Solution** : Utilisez un compte ngrok payant pour une URL fixe, ou testez en production.

### "Connection refused" dans ngrok

Vérifiez que :
- ✅ Votre serveur Next.js tourne sur le port 3000
- ✅ ngrok pointe vers le bon port : `ngrok http 3000`

---

## Résumé

1. ✅ Installez ngrok
2. ✅ Démarrez ngrok : `ngrok http 3000`
3. ✅ Copiez l'URL ngrok (ex: `https://abc123.ngrok.io`)
4. ✅ Configurez le webhook Resend avec cette URL
5. ✅ Envoyez un email depuis Gmail
6. ✅ Vérifiez les logs

**C'est tout !** 🎉


