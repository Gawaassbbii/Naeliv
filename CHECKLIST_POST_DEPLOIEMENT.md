# ✅ Checklist Post-Déploiement - Naeliv

## 🎉 Félicitations ! Votre site est déployé sur naeliv.com

Vérifiez ces points pour que tout fonctionne parfaitement :

---

## ✅ 1. Vérifications de Base

### Site accessible
- [ ] Le site est accessible sur https://naeliv.com
- [ ] Le site est accessible sur https://www.naeliv.com
- [ ] Le SSL (cadenas vert) est actif
- [ ] Toutes les pages se chargent correctement

### Test de navigation
- [ ] La page d'accueil fonctionne
- [ ] La page de connexion fonctionne (nouvelle page Account Chooser)
- [ ] La page d'inscription fonctionne
- [ ] La page /mail fonctionne (si connecté)

---

## 🔐 2. Variables d'Environnement dans Vercel

Vérifiez que toutes les variables sont configurées dans Vercel :

### Dans Vercel > Settings > Environment Variables :

- [ ] `NEXT_PUBLIC_SUPABASE_URL` = votre URL Supabase
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = votre clé anonyme Supabase
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = votre clé service role
- [ ] `WEBHOOK_SECRET` = `whsec_1okDSlt2vHmmmZrSaHviDk3vX9kQgtei`
- [ ] `RESEND_API_KEY` = votre clé API Resend
- [ ] `ALLOW_UNSIGNED_WEBHOOKS` = `false`
- [ ] `NODE_ENV` = `production`

⚠️ **Important** : Cochez les environnements : Production, Preview, Development

---

## 📧 3. Configuration Resend (CRITIQUE pour les emails)

### Mettre à jour le Webhook Resend

1. Allez dans **Resend Dashboard** > **Domains** > **naeliv.com**
2. Trouvez votre webhook
3. Modifiez l'URL de :
   - ❌ `https://interactive-tartly-nayeli.ngrok-free.dev/api/inbound-email` (ngrok local)
   - ✅ `https://naeliv.com/api/inbound-email` (production)

4. Vérifiez que le Secret est : `whsec_1okDSlt2vHmmmZrSaHviDk3vX9kQgtei`
5. Sauvegardez

### Tester la réception d'emails

- [ ] Envoyez un email depuis Gmail vers `test@naeliv.com`
- [ ] Vérifiez dans Resend Dashboard > Logs que le webhook est envoyé
- [ ] Vérifiez dans Vercel > Logs que l'API reçoit les requêtes
- [ ] Vérifiez dans l'application `/mail` que l'email apparaît

---

## 🗄️ 4. Vérification Supabase

### Scripts SQL exécutés

- [ ] Le script `permettre_insertion_emails_webhook.sql` a été exécuté
- [ ] Les fonctions PostgreSQL sont actives
- [ ] Les triggers sont configurés

### Test de connexion

- [ ] Créez un nouveau compte via `/inscription`
- [ ] Connectez-vous via `/connexion`
- [ ] Vérifiez que le profil est créé dans Supabase

---

## 🔍 5. Monitoring et Logs

### Vercel Logs

- [ ] Vérifiez les logs Vercel pour les erreurs
- [ ] Allez dans Vercel > Votre projet > Logs
- [ ] Vérifiez qu'il n'y a pas d'erreurs critiques

### Resend Logs

- [ ] Vérifiez les logs Resend pour les webhooks
- [ ] Allez dans Resend Dashboard > Logs
- [ ] Vérifiez que les webhooks sont envoyés avec succès (status 200)

---

## 🎨 6. Tests Fonctionnels

### Page de Connexion (Account Chooser)

- [ ] La liste des comptes sauvegardés fonctionne
- [ ] Le localStorage sauvegarde les comptes
- [ ] Les transitions entre les vues fonctionnent
- [ ] La connexion fonctionne

### Fonctionnalités PRO/Essential

- [ ] Les limitations Essential fonctionnent
- [ ] Les fonctionnalités PRO fonctionnent
- [ ] Le bouton "Passer à PRO" redirige vers `/paiement`

### Emails

- [ ] Les emails sont reçus et stockés
- [ ] L'affichage des emails fonctionne
- [ ] Les fonctionnalités (archiver, supprimer, etc.) fonctionnent

---

## 🚨 7. Sécurité

### Vérifications de sécurité

- [ ] `ALLOW_UNSIGNED_WEBHOOKS=false` en production
- [ ] Les secrets ne sont pas exposés dans le code
- [ ] Le `.env.local` n'est pas commité sur GitHub
- [ ] Le SSL (HTTPS) est actif

---

## 📊 8. Performance

### Vérifications de performance

- [ ] Le site se charge rapidement
- [ ] Les images sont optimisées
- [ ] Pas d'erreurs dans la console du navigateur (F12)

---

## 🐛 9. Dépannage

### Si les emails ne sont pas reçus

1. Vérifiez les logs Vercel pour les erreurs
2. Vérifiez que le webhook Resend pointe vers `https://naeliv.com/api/inbound-email`
3. Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est configuré dans Vercel
4. Vérifiez que le script SQL `permettre_insertion_emails_webhook.sql` a été exécuté

### Si la connexion ne fonctionne pas

1. Vérifiez que `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont configurés
2. Vérifiez les logs Vercel pour les erreurs Supabase
3. Testez avec un compte de test

---

## 🎯 Prochaines Étapes

Une fois tout vérifié :

1. **Tester avec de vrais utilisateurs** (version BETA)
2. **Monitorer les erreurs** dans Vercel
3. **Collecter les retours** des utilisateurs
4. **Itérer et améliorer** selon les retours

---

## 📝 Notes

- Le site est en **BETA** - attendez-vous à des bugs
- Les logs sont vos amis - vérifiez-les régulièrement
- Les webhooks peuvent prendre quelques minutes pour se propager

---

**Félicitations pour le déploiement ! 🎉**

Votre site Naeliv est maintenant en ligne sur https://naeliv.com

