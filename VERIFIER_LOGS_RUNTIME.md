# 🔍 Vérifier les Logs Runtime Vercel

## ⚠️ Important : Logs Runtime vs Logs Build

Les logs que vous avez partagés sont les **logs de BUILD**. Pour l'erreur 500, nous avons besoin des **logs RUNTIME** (quand l'API est appelée).

## 📋 Comment accéder aux logs runtime

### Méthode 1 : Via Vercel Dashboard

1. Allez dans **Vercel Dashboard** > Votre projet **naeliv**
2. Cliquez sur l'onglet **"Logs"** (pas "Deployments")
3. **Filtrez** par :
   - Fonction : `api/inbound-email`
   - Ou cherchez les lignes avec "Error" ou "500"
4. **Cliquez sur une ligne d'erreur** pour voir les détails

### Méthode 2 : Via l'onglet Functions

1. Allez dans **Vercel Dashboard** > Votre projet > **Functions**
2. Trouvez `api/inbound-email`
3. Cliquez dessus pour voir les logs et les erreurs

## 🔍 Ce qu'il faut chercher

Dans les logs runtime, cherchez :

1. **Erreurs en rouge** :
   - `Error: ...`
   - `TypeError: ...`
   - `ReferenceError: ...`
   - `Cannot find module ...`
   - `is not defined`

2. **Lignes avec "inbound-email"** :
   - `📧 [INBOUND EMAIL] ...`
   - Toute ligne mentionnant l'endpoint

3. **Stack traces complètes** :
   - Copiez toute la stack trace (l'erreur complète)

## 📝 Exemple de ce qu'on cherche

```
[ERROR] TypeError: Cannot read property 'id' of undefined
    at POST (/var/task/app/api/inbound-email/route.ts:256:15)
    ...
```

ou

```
[ERROR] SUPABASE_SERVICE_ROLE_KEY is not defined
```

## ✅ Vérifier aussi le dernier déploiement

1. Allez dans **Vercel** > **Deployments**
2. Vérifiez que le **dernier déploiement** est bien le commit `97d0874` (celui avec ma correction)
3. Si c'est encore `63b9f37`, attendez quelques minutes ou déclenchez un nouveau déploiement

## 🚀 Forcer un nouveau déploiement

Si le nouveau commit n'est pas déployé :

1. Allez dans **Vercel** > **Deployments**
2. Cliquez sur **"Redeploy"** sur le dernier déploiement
3. Ou poussez un nouveau commit vide :
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push origin main
   ```


