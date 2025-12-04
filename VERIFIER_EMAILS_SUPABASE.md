# 🔍 Vérifier que les emails sont bien dans Supabase

## Problème

Les emails reçus ne s'affichent pas dans la boîte de réception, même si le webhook fonctionne.

## Diagnostic : Vérifier dans Supabase

### Étape 1 : Vérifier que l'utilisateur existe

1. Allez dans **Supabase Dashboard** > **Table Editor** > **profiles**
2. Cherchez `test2@naeliv.com`
3. **Si l'utilisateur n'existe pas** :
   - Allez sur https://www.naeliv.com/inscription
   - Créez un compte avec `test2@naeliv.com`
   - Confirmez l'email si nécessaire

### Étape 2 : Vérifier que les emails sont insérés

1. Allez dans **Supabase Dashboard** > **Table Editor** > **emails**
2. Cherchez les emails avec `to` = `test2@naeliv.com` (ou cherchez par `user_id`)
3. **Vérifiez** :
   - Les emails sont-ils présents ?
   - Le champ `archived` est-il à `false` ?
   - Le champ `deleted` est-il à `false` ?
   - Le `user_id` correspond-il à l'ID de l'utilisateur `test2@naeliv.com` ?

### Étape 3 : Vérifier les logs Vercel

1. Allez dans **Vercel** > Votre projet > **Logs**
2. Cherchez les lignes avec `📧 [INBOUND EMAIL]`
3. Vérifiez s'il y a des erreurs lors de l'insertion :
   - `✅ Email received and stored:` → Email inséré avec succès
   - `Error inserting email:` → Erreur lors de l'insertion

### Étape 4 : Vérifier les logs Resend

1. Allez dans **Resend Dashboard** > **Logs**
2. Cherchez les événements `email.received` récents
3. Vérifiez :
   - Le statut est-il **"Succeeded"** (vert) ?
   - Le Response Body contient-il `"success": true` ?

## Solutions selon le problème

### Si l'utilisateur n'existe pas

**Solution** : Créez le compte via `/inscription`

### Si les emails ne sont pas dans Supabase

**Causes possibles** :
1. `SUPABASE_SERVICE_ROLE_KEY` n'est pas configuré dans Vercel
2. Erreur lors de l'insertion (vérifiez les logs Vercel)
3. Le script SQL `permettre_insertion_emails_webhook.sql` n'a pas été exécuté

**Solution** :
1. Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est bien configuré dans Vercel
2. Vérifiez les logs Vercel pour les erreurs
3. Exécutez le script SQL si nécessaire

### Si les emails sont dans Supabase mais ne s'affichent pas

**Causes possibles** :
1. Problème de RLS (Row Level Security) qui empêche la lecture
2. Le `user_id` ne correspond pas
3. Les emails sont marqués comme `archived: true` ou `deleted: true`

**Solution** :
1. Vérifiez dans Supabase que `archived = false` et `deleted = false`
2. Vérifiez que le `user_id` correspond bien à l'utilisateur connecté
3. Vérifiez les politiques RLS dans Supabase

## Test rapide : Requête SQL

Dans **Supabase SQL Editor**, exécutez :

```sql
-- Vérifier l'utilisateur
SELECT id, email FROM profiles WHERE email = 'test2@naeliv.com';

-- Vérifier les emails (remplacez USER_ID par l'ID de l'utilisateur)
SELECT 
  id, 
  from_email, 
  subject, 
  archived, 
  deleted, 
  received_at,
  user_id
FROM emails 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'test2@naeliv.com')
ORDER BY received_at DESC
LIMIT 10;
```

## Si tout est correct mais ça ne fonctionne toujours pas

1. **Rafraîchissez la page** `/mail` (F5)
2. **Vérifiez la console du navigateur** (F12) pour les erreurs
3. **Vérifiez les logs Vercel** pour les erreurs côté serveur
4. **Partagez-moi** :
   - Le résultat de la requête SQL ci-dessus
   - Les erreurs dans la console du navigateur
   - Les logs Vercel récents

