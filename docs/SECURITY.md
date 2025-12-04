# 🔐 Sécurité - Niveau Gmail/Outlook

Ce document décrit toutes les mesures de sécurité implémentées pour protéger l'application au niveau des meilleurs services email.

## 🛡️ Mesures de Sécurité Implémentées

### 1. **Authentification des Webhooks**
- ✅ Vérification des signatures HMAC-SHA256
- ✅ Support Resend et Mailgun
- ✅ Protection contre les requêtes non autorisées
- ✅ Utilisation de `crypto.timingSafeEqual` pour éviter les attaques par timing

### 2. **Rate Limiting**
- ✅ Limite de 100 requêtes par minute par IP
- ✅ Headers HTTP standards (X-RateLimit-*)
- ✅ Réponse 429 avec Retry-After
- ⚠️ **Pour la production** : Migrer vers Redis pour un rate limiting distribué

### 3. **Validation des Emails**
- ✅ Validation RFC 5322 stricte
- ✅ Vérification de la longueur (max 320 caractères)
- ✅ Protection contre les caractères dangereux
- ✅ Validation des domaines

### 4. **Sanitization**
- ✅ Échappement HTML/XSS
- ✅ Nettoyage des caractères de contrôle
- ✅ Limitation de la longueur des champs
- ⚠️ **Recommandé** : Utiliser DOMPurify pour le HTML

### 5. **Détection de Spam**
- ✅ Analyse des mots-clés suspects
- ✅ Détection des URLs raccourcies
- ✅ Vérification des domaines suspects
- ✅ Score de spam avec seuil configurable
- ⚠️ **Pour la production** : Intégrer SpamAssassin ou Cloudflare Email Security

### 6. **Blacklist/Whitelist**
- ✅ Support des listes noires
- ✅ Support des listes blanches
- ✅ Configuration via variables d'environnement

### 7. **Protection contre les Attaques**
- ✅ Validation de la taille des emails (max 25MB)
- ✅ Protection contre l'injection SQL (via Supabase)
- ✅ Protection contre XSS (sanitization)
- ✅ Logs de sécurité pour audit

### 8. **Gestion des Erreurs**
- ✅ Ne pas révéler d'informations sensibles dans les erreurs
- ✅ Logs détaillés côté serveur
- ✅ Messages d'erreur génériques pour les clients

---

## 🔒 Configuration Requise

### Variables d'Environnement

```env
# Obligatoire
WEBHOOK_SECRET=your_random_secret_key_min_32_chars
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Optionnel (selon le service utilisé)
RESEND_API_KEY=re_xxxxxxxxxxxxx
MAILGUN_API_KEY=your_mailgun_api_key

# Sécurité
EMAIL_BLACKLIST=spam@example.com,bad@example.com
NODE_ENV=production
ALLOW_UNSIGNED_WEBHOOKS=false  # Toujours false en production !
```

### Générer un Secret Sécurisé

```bash
# Générer un secret aléatoire de 64 caractères
openssl rand -hex 32
```

---

## 🚨 Sécurité en Production

### Checklist de Déploiement

- [ ] `WEBHOOK_SECRET` configuré avec un secret fort (min 32 caractères)
- [ ] `ALLOW_UNSIGNED_WEBHOOKS=false` (ou non défini)
- [ ] `NODE_ENV=production`
- [ ] Rate limiting configuré avec Redis (recommandé)
- [ ] Logs de sécurité activés et monitorés
- [ ] HTTPS activé (obligatoire)
- [ ] Headers de sécurité configurés (CORS, CSP, etc.)
- [ ] Monitoring des tentatives d'attaque
- [ ] Backup régulier de la base de données

### Headers de Sécurité Recommandés

Ajoutez ces headers dans votre configuration Next.js/Vercel :

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
];
```

---

## 📊 Monitoring et Alertes

### Métriques à Surveiller

1. **Taux d'erreur** : Doit être < 1%
2. **Temps de réponse** : Doit être < 500ms
3. **Rate limit hits** : Surveiller les pics
4. **Spam détecté** : Analyser les patterns
5. **Tentatives d'attaque** : Alertes immédiates

### Logs de Sécurité

Tous les événements de sécurité sont logués :
- ✅ Emails reçus (avec métadonnées)
- ✅ Tentatives de rate limit
- ✅ Signatures invalides
- ✅ Emails bloqués (blacklist)
- ✅ Spam détecté
- ✅ Erreurs de traitement

---

## 🔄 Améliorations Futures

### Court Terme
- [ ] Intégration DOMPurify pour le HTML
- [ ] Rate limiting avec Redis
- [ ] Quarantaine pour les emails suspects

### Moyen Terme
- [ ] Intégration SpamAssassin
- [ ] Machine Learning pour la détection de spam
- [ ] Analyse des pièces jointes
- [ ] Protection contre les virus

### Long Terme
- [ ] Chiffrement end-to-end
- [ ] Authentification DMARC/DKIM/SPF stricte
- [ ] Analyse comportementale
- [ ] Intégration avec services de réputation (Spamhaus, etc.)

---

## 🧪 Tests de Sécurité

### Tests à Effectuer

1. **Test de signature invalide**
   ```bash
   curl -X POST https://your-domain.com/api/inbound-email \
     -H "Content-Type: application/json" \
     -H "X-Resend-Signature: invalid" \
     -d '{"test": "data"}'
   # Doit retourner 401
   ```

2. **Test de rate limiting**
   ```bash
   # Envoyer 101 requêtes rapidement
   # La 101ème doit retourner 429
   ```

3. **Test de validation d'email**
   ```bash
   # Envoyer un email avec un format invalide
   # Doit retourner 400
   ```

4. **Test de taille**
   ```bash
   # Envoyer un email > 25MB
   # Doit retourner 413
   ```

---

## 📚 Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [RFC 5322 - Email Format](https://tools.ietf.org/html/rfc5322)
- [Resend Security](https://resend.com/docs/security)
- [Mailgun Security](https://documentation.mailgun.com/en/latest/security.html)

---

## ⚠️ Avertissements

1. **Ne jamais** désactiver la vérification de signature en production
2. **Toujours** utiliser HTTPS
3. **Ne jamais** exposer les secrets dans le code
4. **Toujours** valider et sanitizer les données utilisateur
5. **Toujours** monitorer les logs de sécurité

---

**Dernière mise à jour** : 2024
**Niveau de sécurité** : Production-ready (avec améliorations recommandées)

