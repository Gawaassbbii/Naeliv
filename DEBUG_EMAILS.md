# 🐛 Debug : Emails non reçus

## Problème identifié

Le webhook Resend est reçu mais les emails n'apparaissent pas dans l'application.

## Causes possibles

### 1. Structure du webhook Resend

Le webhook Resend envoie `to` comme un **tableau** : `["test2@naeliv.com"]` au lieu d'une string.

**Solution** : J'ai corrigé la fonction `extractEmailData` pour gérer les tableaux.

### 2. Contenu de l'email manquant

Resend peut ne pas envoyer le body/text directement dans le webhook. Il faut peut-être récupérer l'email via l'API Resend.

### 3. Utilisateur inexistant dans Supabase

Si `test2@naeliv.com` n'existe pas dans la table `profiles`, l'email ne peut pas être inséré.

**Vérification** :
1. Allez dans Supabase Dashboard > Table Editor > `profiles`
2. Vérifiez si `test2@naeliv.com` existe
3. Si non, créez un compte via `/inscription` avec cette adresse

### 4. Variables d'environnement manquantes

Vérifiez dans Vercel > Settings > Environment Variables :

- [ ] `SUPABASE_SERVICE_ROLE_KEY` est configuré
- [ ] `WEBHOOK_SECRET` = `whsec_1okDSlt2vHmmmZrSaHviDk3vX9kQgtei`
- [ ] `NEXT_PUBLIC_SUPABASE_URL` est configuré
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` est configuré

### 5. Logs Vercel

Vérifiez les logs Vercel pour voir les erreurs :

1. Allez dans Vercel > Votre projet > Logs
2. Filtrez par "inbound-email"
3. Cherchez les erreurs

**Erreurs courantes** :
- `Invalid signature` → Vérifiez `WEBHOOK_SECRET`
- `User not found` → L'utilisateur n'existe pas dans Supabase
- `RLS policy violation` → `SUPABASE_SERVICE_ROLE_KEY` manquant

## Actions à faire

### 1. Vérifier les logs Vercel

```bash
# Dans Vercel Dashboard > Logs
# Cherchez les lignes avec "📧 [INBOUND EMAIL]"
```

### 2. Vérifier que l'utilisateur existe

```sql
-- Dans Supabase SQL Editor
SELECT * FROM profiles WHERE email = 'test2@naeliv.com';
```

Si aucun résultat, créez le compte via `/inscription`.

### 3. Tester avec un compte existant

1. Créez un compte via `/inscription` avec `test2@naeliv.com`
2. Envoyez un email vers cette adresse
3. Vérifiez si l'email apparaît

### 4. Vérifier le webhook Resend

1. Allez dans Resend Dashboard > Domains > naeliv.com
2. Vérifiez que l'URL est : `https://naeliv.com/api/inbound-email`
3. Vérifiez que le Secret est : `whsec_1okDSlt2vHmmmZrSaHviDk3vX9kQgtei`
4. Testez le webhook (bouton "Test" si disponible)

### 5. Déployer la correction

J'ai corrigé la fonction `extractEmailData` pour gérer les tableaux. 

**Déployez la correction** :
1. Committez les changements
2. Poussez sur GitHub
3. Vercel redéploiera automatiquement

```bash
git add app/api/inbound-email/route.ts
git commit -m "Fix: Gérer les tableaux dans extractEmailData pour Resend"
git push origin main
```

## Test après correction

1. Attendez que Vercel redéploie (2-3 minutes)
2. Envoyez un nouvel email vers `test2@naeliv.com`
3. Vérifiez les logs Vercel
4. Vérifiez dans `/mail` si l'email apparaît

## Si ça ne fonctionne toujours pas

Partagez-moi :
1. Les logs Vercel (lignes avec "📧 [INBOUND EMAIL]")
2. Le résultat de la requête SQL pour vérifier l'utilisateur
3. Les erreurs dans la console du navigateur (F12)


