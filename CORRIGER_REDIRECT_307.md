# 🔧 Corriger l'erreur 307 (Temporary Redirect)

## Problème

Le webhook Resend reçoit une **307 Temporary Redirect** au lieu d'une réponse 200. Cela signifie que l'URL redirige au lieu de traiter directement la requête.

## Causes possibles

### 1. Redirection HTTPS/HTTP
Vercel peut rediriger automatiquement HTTP vers HTTPS, ce qui cause un 307.

**Solution** : Assurez-vous que le webhook Resend utilise **HTTPS** :
- ✅ `https://naeliv.com/api/inbound-email`
- ❌ `http://naeliv.com/api/inbound-email`

### 2. Redirection www/non-www
Si vous avez configuré une redirection de `naeliv.com` vers `www.naeliv.com`, cela peut causer un 307.

**Solution** : Utilisez l'URL exacte configurée dans Vercel :
- Si votre domaine principal est `www.naeliv.com`, utilisez : `https://www.naeliv.com/api/inbound-email`
- Sinon, utilisez : `https://naeliv.com/api/inbound-email`

### 3. Configuration Vercel
Vercel peut avoir des redirections automatiques configurées.

**Vérification** :
1. Allez dans Vercel > Votre projet > Settings > Domains
2. Vérifiez s'il y a des redirections configurées
3. Si `naeliv.com` redirige vers `www.naeliv.com`, utilisez `www.naeliv.com` dans le webhook

## Solution : Configurer le webhook Resend

### Étape 1 : Vérifier l'URL exacte

1. Allez dans **Vercel** > Votre projet > **Settings** > **Domains**
2. Notez quel domaine est marqué comme **"Production"** (avec la flèche vers le haut)
3. Utilisez **exactement** ce domaine dans le webhook Resend

### Étape 2 : Mettre à jour le webhook Resend

1. Allez dans **Resend Dashboard** > **Domains** > **naeliv.com**
2. Trouvez votre webhook
3. Modifiez l'URL pour utiliser le domaine exact :
   - Si `www.naeliv.com` est en production : `https://www.naeliv.com/api/inbound-email`
   - Si `naeliv.com` est en production : `https://naeliv.com/api/inbound-email`
4. Vérifiez que c'est bien **HTTPS** (pas HTTP)
5. Vérifiez que le Secret est : `whsec_1okDSlt2vHmmmZrSaHviDk3vX9kQgtei`
6. Sauvegardez

### Étape 3 : Tester

1. Attendez 1-2 minutes
2. Envoyez un email de test vers `test2@naeliv.com`
3. Vérifiez dans Resend Dashboard > Logs que le webhook est envoyé avec succès (status 200)
4. Vérifiez dans Vercel > Logs que l'API reçoit la requête

## Alternative : Désactiver les redirections dans Vercel

Si vous voulez que les deux domaines fonctionnent :

1. Dans Vercel > Settings > Domains
2. Assurez-vous que `naeliv.com` et `www.naeliv.com` sont tous les deux configurés
3. Vérifiez qu'il n'y a pas de redirection automatique

## Vérification

Après avoir corrigé :

1. Le webhook Resend devrait recevoir un **200 OK** au lieu de **307**
2. Les emails devraient être reçus et stockés
3. Les logs Vercel devraient montrer `📧 [INBOUND EMAIL] Requête reçue`

## Si ça ne fonctionne toujours pas

Vérifiez les logs Vercel pour voir :
1. Si la requête arrive bien à l'API
2. S'il y a des erreurs dans le traitement
3. Si les variables d'environnement sont bien configurées

