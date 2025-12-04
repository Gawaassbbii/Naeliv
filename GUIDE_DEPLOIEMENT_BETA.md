# 🚀 Guide de Déploiement BETA - naeliv.com

Guide spécifique pour déployer la version BETA de Naeliv sur `naeliv.com`.

## ⚠️ Considérations BETA

### Avant de Déployer

1. **Badge BETA** : ✅ Déjà ajouté dans l'interface
2. **Gestion des Erreurs** : Vérifiez que toutes les erreurs sont bien catchées
3. **Logs** : Activez les logs détaillés pour le débogage
4. **Monitoring** : Configurez le monitoring (Vercel Analytics, Sentry, etc.)

---

## 📋 Checklist Pré-Déploiement BETA

### Code
- [x] Badge BETA visible dans l'interface
- [x] Metadata mise à jour avec mention BETA
- [ ] Tous les `console.error` sont bien gérés
- [ ] Les erreurs utilisateur affichent des messages clairs
- [ ] Pas de données sensibles dans les logs publics

### Variables d'Environnement
- [ ] Toutes les variables sont configurées dans Vercel
- [ ] `NODE_ENV=production` (même en BETA)
- [ ] `ALLOW_UNSIGNED_WEBHOOKS=false` (sécurité)
- [ ] Tous les secrets sont corrects

### Base de Données
- [ ] Scripts SQL exécutés dans Supabase
- [ ] RLS (Row Level Security) activé
- [ ] Backups configurés

### Services Externes
- [ ] Resend configuré avec le bon domaine
- [ ] Webhook Resend pointe vers la production
- [ ] Supabase en mode production

---

## 🚀 Déploiement sur Vercel

### 1. Préparer le Code

```bash
# Vérifier que tout compile
npm run build

# Vérifier les erreurs
npm run lint
```

### 2. Variables d'Environnement dans Vercel

**⚠️ IMPORTANT** : Ajoutez toutes ces variables dans Vercel Dashboard > Settings > Environment Variables :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://qmwcvaaviheclxgerdgq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key

# Webhook
WEBHOOK_SECRET=whsec_1okDSlt2vHmmmZrSaHviDk3vX9kQgtei

# Resend
RESEND_API_KEY=votre_resend_api_key

# Production
NODE_ENV=production
ALLOW_UNSIGNED_WEBHOOKS=false
```

**Cochez** : Production, Preview, Development

### 3. Déployer

1. Push sur GitHub
2. Vercel détecte automatiquement et déploie
3. Vérifiez les logs de déploiement

### 4. Configurer le Domaine

1. Vercel Dashboard > Settings > Domains
2. Ajouter `naeliv.com`
3. Suivre les instructions DNS
4. Attendre la propagation (24-48h)

### 5. Mettre à Jour Resend

1. Resend Dashboard > Domains > naeliv.com
2. Modifier le webhook :
   - URL : `https://naeliv.com/api/inbound-email`
   - Secret : `whsec_1okDSlt2vHmmmZrSaHviDk3vX9kQgtei`
   - Events : `email.received`

---

## 🔍 Monitoring BETA

### Vercel Analytics

1. Activez Vercel Analytics dans votre projet
2. Surveillez les erreurs et les performances

### Logs

- **Vercel Logs** : Dashboard > Logs
- **Resend Logs** : Dashboard > Logs
- **Supabase Logs** : Dashboard > Logs

### Erreurs à Surveiller

- Erreurs 500 dans l'API
- Échecs de webhook Resend
- Erreurs de connexion Supabase
- Erreurs de signature webhook

---

## 🐛 Gestion des Bugs en Production BETA

### Si un Bug Critique Apparaît

1. **Identifiez le problème** dans les logs
2. **Corrigez le code** localement
3. **Testez** en local
4. **Push sur GitHub** → Vercel redéploie automatiquement
5. **Vérifiez** que le fix fonctionne en production

### Communication avec les Utilisateurs BETA

- Ajoutez une page `/beta-status` pour les mises à jour
- Utilisez des notifications toast pour les bugs connus
- Documentez les bugs dans `BETA_NOTES.md`

---

## 📊 Métriques à Surveiller

- **Taux d'erreur** : Doit être < 5% en BETA
- **Temps de réponse** : Doit être < 2s
- **Taux de succès des webhooks** : Doit être > 95%
- **Utilisateurs actifs** : Pour suivre la croissance

---

## ✅ Checklist Post-Déploiement

- [ ] Site accessible sur `https://naeliv.com`
- [ ] SSL actif (cadenas vert)
- [ ] Badge BETA visible
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Réception d'emails fonctionne
- [ ] Webhook Resend fonctionne
- [ ] Logs Vercel sans erreurs critiques
- [ ] Monitoring configuré

---

## 🎯 Prochaines Étapes Post-Déploiement

1. **Tester** toutes les fonctionnalités principales
2. **Surveiller** les logs pendant 24-48h
3. **Collecter** les retours utilisateurs
4. **Corriger** les bugs critiques rapidement
5. **Itérer** avec des mises à jour régulières

---

**Bonne chance avec le déploiement BETA !** 🚀


