# 🐛 Guide de Dépannage - Emails Non Reçus

Si vous avez envoyé un email à `test2@naeliv.com` mais ne l'avez pas reçu, suivez ce guide étape par étape.

## 🔍 Checklist de Vérification

### 1. Vérifier les Logs du Serveur

**Dans votre terminal où tourne `npm run dev`**, vous devriez voir des logs comme :

```
📧 [INBOUND EMAIL] Requête reçue à 2024-...
📧 [INBOUND EMAIL] Headers: { ... }
```

**Si vous ne voyez AUCUN log :**
- ❌ Resend n'envoie pas les emails à votre API
- ✅ Vérifiez la configuration du webhook dans Resend

**Si vous voyez des logs mais avec des erreurs :**
- ✅ L'API reçoit bien les requêtes
- ❌ Il y a un problème de traitement (voir les erreurs ci-dessous)

---

### 2. Vérifier la Configuration du Webhook Resend

1. **Allez dans Resend Dashboard** > **Domains** > **naeliv.com**
2. **Vérifiez la section "Inbound Email" ou "Webhooks"**
3. **Vérifiez que :**
   - ✅ L'URL est correcte : `https://votre-domaine.com/api/inbound-email`
   - ✅ Pour les tests locaux, utilisez un tunnel (ngrok) : `https://abc123.ngrok.io/api/inbound-email`
   - ✅ Le secret correspond à `WEBHOOK_SECRET` dans `.env.local`
   - ✅ L'événement `email.received` est sélectionné

**⚠️ Important :** Resend ne peut pas envoyer des webhooks vers `localhost`. Vous devez :
- Soit utiliser un tunnel (ngrok, localtunnel, etc.)
- Soit tester en production

---

### 3. Vérifier que l'Utilisateur Existe

L'API cherche un utilisateur avec l'email `test2@naeliv.com` dans la table `profiles`.

**Vérifiez dans Supabase :**
1. Allez dans **Table Editor** > **profiles**
2. Cherchez un utilisateur avec `email = 'test2@naeliv.com'` OU `username = 'test2'`
3. Si l'utilisateur n'existe pas :
   - ❌ L'email ne sera pas stocké
   - ✅ Créez un compte avec `test2@naeliv.com` ou connectez-vous avec ce compte

**Note :** L'API cherche d'abord par email complet, puis par username (partie avant @).

---

### 4. Vérifier le Script SQL

**Avez-vous exécuté le script SQL ?**

1. Allez dans **Supabase Dashboard** > **SQL Editor**
2. Exécutez le script : `executer dans sql/permettre_insertion_emails_webhook.sql`
3. Vérifiez qu'il n'y a pas d'erreurs

**Vérifiez que la fonction existe :**
```sql
SELECT proname FROM pg_proc WHERE proname = 'insert_email_via_webhook';
```

Si la fonction n'existe pas, exécutez le script SQL.

---

### 5. Vérifier les Erreurs dans les Logs

**Erreurs courantes et solutions :**

#### ❌ "Webhook secret not configured"
```
Solution: Vérifiez que WEBHOOK_SECRET est dans .env.local
```

#### ❌ "Invalid signature"
```
Solution: Vérifiez que le secret dans Resend correspond à WEBHOOK_SECRET
```

#### ❌ "User not found for email: test2@naeliv.com"
```
Solution: Créez un compte avec test2@naeliv.com ou connectez-vous avec ce compte
```

#### ❌ "Error storing email: ..."
```
Solution: 
1. Vérifiez que SUPABASE_SERVICE_ROLE_KEY est configuré
2. Vérifiez que le script SQL a été exécuté
3. Vérifiez les politiques RLS dans Supabase
```

#### ❌ "Rate limit exceeded"
```
Solution: Attendez quelques secondes et réessayez
```

---

### 6. Tester avec un Tunnel Local (ngrok)

Si vous testez en local, Resend ne peut pas atteindre `localhost`. Utilisez ngrok :

1. **Installez ngrok** : https://ngrok.com/
2. **Démarrez votre serveur** : `npm run dev`
3. **Dans un autre terminal**, lancez : `ngrok http 3000`
4. **Copiez l'URL ngrok** (ex: `https://abc123.ngrok.io`)
5. **Dans Resend**, configurez le webhook avec : `https://abc123.ngrok.io/api/inbound-email`
6. **Testez** en envoyant un email à `test2@naeliv.com`

---

### 7. Vérifier dans Supabase

**Vérifiez si l'email a été créé :**

1. Allez dans **Supabase Dashboard** > **Table Editor** > **emails**
2. Cherchez les emails récents
3. Filtrez par `user_id` si vous connaissez l'ID de l'utilisateur

**Si l'email est dans Supabase mais pas dans l'interface :**
- ✅ L'API fonctionne
- ❌ Problème d'affichage dans l'interface
- ✅ Vérifiez que vous êtes connecté avec le bon compte

---

### 8. Vérifier les Logs Resend

1. **Allez dans Resend Dashboard** > **Logs** ou **Events**
2. **Cherchez l'événement** `email.received` pour votre email
3. **Vérifiez le statut** :
   - ✅ "Delivered" = webhook envoyé avec succès
   - ❌ "Failed" = problème d'envoi (vérifiez l'URL)
   - ⏳ "Pending" = en attente

---

## 🧪 Test Manuel de l'API

Vous pouvez tester l'API manuellement avec curl :

```bash
curl -X POST http://localhost:3000/api/inbound-email \
  -H "Content-Type: application/json" \
  -H "x-resend-signature: test" \
  -d '{
    "type": "email.received",
    "data": {
      "from": "test@example.com",
      "to": "test2@naeliv.com",
      "subject": "Test Email",
      "text": "Test body"
    }
  }'
```

**Note :** Ce test échouera probablement à cause de la vérification de signature, mais vous verrez au moins si l'API répond.

---

## 📋 Résumé des Points à Vérifier

- [ ] Les logs du serveur montrent des requêtes reçues
- [ ] Le webhook est configuré dans Resend avec la bonne URL
- [ ] L'utilisateur `test2` existe dans la table `profiles`
- [ ] Le script SQL `permettre_insertion_emails_webhook.sql` a été exécuté
- [ ] `SUPABASE_SERVICE_ROLE_KEY` est configuré dans `.env.local`
- [ ] `WEBHOOK_SECRET` correspond entre Resend et `.env.local`
- [ ] Pour les tests locaux, un tunnel (ngrok) est configuré
- [ ] Les logs Resend montrent que le webhook a été envoyé

---

**Besoin d'aide supplémentaire ?** Partagez les logs de votre serveur et je pourrai vous aider à identifier le problème exact.


