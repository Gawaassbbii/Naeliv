# 🚀 Démarrer ngrok - Instructions Rapides

## Commande à exécuter

Dans votre terminal (PowerShell ou CMD), tapez :

```bash
ngrok http 3000
```

## Ce qui va se passer

1. ngrok va démarrer et créer un tunnel
2. Vous verrez quelque chose comme :
   ```
   Forwarding  https://abc123.ngrok.io -> http://localhost:3000
   ```
3. **Copiez l'URL** (ex: `https://abc123.ngrok.io`)

## Important

- ✅ **Gardez ce terminal ouvert** - ngrok doit rester actif
- ✅ **Gardez aussi votre serveur Next.js ouvert** dans un autre terminal
- ✅ L'URL ngrok change à chaque redémarrage (plan gratuit)

## Prochaines étapes

Une fois que vous avez l'URL ngrok :

1. Allez dans **Resend Dashboard** > **Domains** > **naeliv.com**
2. Configurez le webhook avec :
   - URL : `https://VOTRE-URL-NGROK.ngrok.io/api/inbound-email`
   - Secret : `whsec_1okDSlt2vHmmmZrSaHviDk3vX9kQgtei`
   - Events : `email.received`
3. Testez en envoyant un email depuis Gmail vers `test2@naeliv.com`

---

**Commande exacte :** `ngrok http 3000`


