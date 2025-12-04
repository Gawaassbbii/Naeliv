# 🔧 Corriger l'URL du Webhook Resend

## ❌ Problème identifié

Le webhook Resend pointe vers :
- ❌ `https://www.naeliv.com/` (sans le chemin de l'API)

Il doit pointer vers :
- ✅ `https://www.naeliv.com/api/inbound-email` (avec le chemin complet)

## ✅ Solution

### Étape 1 : Modifier l'URL du webhook dans Resend

1. Allez dans **Resend Dashboard** > **Domains** > **naeliv.com**
2. Trouvez votre webhook (celui qui écoute `email.received`)
3. Cliquez sur **"Edit"** ou le menu (trois points)
4. Modifiez l'URL de :
   - ❌ `https://www.naeliv.com/`
   - ✅ `https://www.naeliv.com/api/inbound-email`
5. Vérifiez que le **Signing Secret** est : `whsec_1okDSlt2vHmmmZrSaHviDk3vX9kQgtei`
6. Sauvegardez

### Étape 2 : Vérifier que l'endpoint répond

Testez manuellement l'endpoint :

1. Ouvrez votre navigateur
2. Allez sur : `https://www.naeliv.com/api/inbound-email`
3. Vous devriez voir une réponse JSON :
   ```json
   {
     "status": "ok",
     "message": "Inbound email endpoint is ready",
     "timestamp": "..."
   }
   ```

Si vous voyez cette réponse, l'endpoint fonctionne ✅

### Étape 3 : Tester le webhook

1. Attendez 1-2 minutes après avoir modifié l'URL
2. Envoyez un email de test vers `test2@naeliv.com`
3. Vérifiez dans Resend Dashboard > Logs :
   - Le statut devrait être **"Succeeded"** (vert) au lieu de "Failed"
   - Le **Response Body** devrait contenir :
     ```json
     {
       "success": true,
       "emailId": "...",
       "message": "Email received and stored successfully"
     }
     ```

### Étape 4 : Vérifier les logs Vercel

1. Allez dans **Vercel** > Votre projet > **Logs**
2. Cherchez les lignes avec `📧 [INBOUND EMAIL]`
3. Vous devriez voir :
   - `📧 [INBOUND EMAIL] Requête reçue à ...`
   - `📧 [INBOUND EMAIL] Signature Resend (Svix) vérifiée avec succès`
   - `✅ Email received and stored: ...`

## 🔍 Si ça ne fonctionne toujours pas

### Vérifier les variables d'environnement dans Vercel

Assurez-vous que toutes ces variables sont configurées dans **Vercel** > Settings > Environment Variables :

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` ⚠️ CRITIQUE
- [ ] `WEBHOOK_SECRET` = `whsec_1okDSlt2vHmmmZrSaHviDk3vX9kQgtei`
- [ ] `RESEND_API_KEY`
- [ ] `NODE_ENV` = `production`
- [ ] `ALLOW_UNSIGNED_WEBHOOKS` = `false`

### Vérifier que l'utilisateur existe

L'email ne peut pas être inséré si `test2@naeliv.com` n'existe pas dans Supabase :

1. Allez dans **Supabase Dashboard** > **Table Editor** > **profiles**
2. Cherchez `test2@naeliv.com`
3. Si l'utilisateur n'existe pas :
   - Allez sur https://www.naeliv.com/inscription
   - Créez un compte avec `test2@naeliv.com`

## ✅ Checklist

- [ ] URL du webhook : `https://www.naeliv.com/api/inbound-email` (avec `/api/inbound-email`)
- [ ] Signing Secret : `whsec_1okDSlt2vHmmmZrSaHviDk3vX9kQgtei`
- [ ] L'endpoint répond (test manuel dans le navigateur)
- [ ] Toutes les variables d'environnement sont configurées dans Vercel
- [ ] L'utilisateur `test2@naeliv.com` existe dans Supabase
- [ ] Le webhook est "Enabled" dans Resend

