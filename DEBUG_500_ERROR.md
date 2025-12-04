# 🐛 Debug : Erreur 500 sur /api/inbound-email

## Problème

L'endpoint `https://www.naeliv.com/api/inbound-email` retourne une **500 Internal Server Error**.

## Causes possibles

### 1. Variables d'environnement manquantes dans Vercel

L'erreur 500 peut être causée par des variables d'environnement manquantes.

**Vérifiez dans Vercel** > Settings > Environment Variables :

- [ ] `NEXT_PUBLIC_SUPABASE_URL` est configuré
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` est configuré
- [ ] `SUPABASE_SERVICE_ROLE_KEY` est configuré ⚠️ CRITIQUE
- [ ] `WEBHOOK_SECRET` est configuré
- [ ] `RESEND_API_KEY` est configuré
- [ ] `NODE_ENV` = `production`
- [ ] `ALLOW_UNSIGNED_WEBHOOKS` = `false`

### 2. Erreur dans les logs Vercel

**Action immédiate** :

1. Allez dans **Vercel** > Votre projet > **Logs**
2. Cherchez les erreurs récentes (rouge)
3. Copiez l'erreur complète et partagez-la

Les erreurs courantes :
- `Cannot find module` → Import manquant
- `SUPABASE_SERVICE_ROLE_KEY is not defined` → Variable manquante
- `TypeError: Cannot read property...` → Erreur dans le code

### 3. Problème avec l'endpoint GET

L'endpoint GET devrait fonctionner même sans variables d'environnement complètes. Si même le GET échoue, c'est probablement un problème d'import ou de build.

## Solution : Vérifier les logs Vercel

### Étape 1 : Accéder aux logs

1. Allez dans **Vercel Dashboard**
2. Sélectionnez votre projet **naeliv**
3. Cliquez sur l'onglet **"Logs"**
4. Filtrez par "inbound-email" ou cherchez les erreurs récentes

### Étape 2 : Identifier l'erreur

Cherchez les lignes en rouge qui contiennent :
- `Error`
- `TypeError`
- `ReferenceError`
- `Cannot find module`
- `is not defined`

### Étape 3 : Solutions selon l'erreur

#### Si l'erreur est "SUPABASE_SERVICE_ROLE_KEY is not defined"

→ Ajoutez `SUPABASE_SERVICE_ROLE_KEY` dans Vercel > Settings > Environment Variables

#### Si l'erreur est "Cannot find module '@/lib/...'"

→ Problème d'import. Vérifiez que tous les fichiers existent et sont correctement importés.

#### Si l'erreur est "TypeError" ou "ReferenceError"

→ Erreur dans le code. Partagez l'erreur complète pour que je puisse la corriger.

## Test rapide : Endpoint GET

L'endpoint GET devrait retourner une réponse même si les variables d'environnement ne sont pas toutes configurées.

**Test** :
1. Allez sur `https://www.naeliv.com/api/inbound-email`
2. Vous devriez voir :
   ```json
   {
     "status": "ok",
     "message": "Inbound email endpoint is ready",
     "timestamp": "..."
   }
   ```

Si même le GET échoue avec 500, c'est un problème de build ou d'import.

## Actions immédiates

1. **Vérifiez les logs Vercel** et partagez l'erreur exacte
2. **Vérifiez que toutes les variables d'environnement sont configurées** dans Vercel
3. **Vérifiez que le build fonctionne** : Allez dans Vercel > Deployments et vérifiez qu'il n'y a pas d'erreurs de build

## Si vous ne pouvez pas accéder aux logs

Partagez-moi :
1. L'erreur exacte que vous voyez (si elle apparaît dans le navigateur)
2. Les variables d'environnement configurées dans Vercel (sans les valeurs sensibles, juste les noms)
3. Si le build Vercel a réussi (Vercel > Deployments > Dernier déploiement)


