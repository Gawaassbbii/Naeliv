# 🔑 Guide : Comment obtenir toutes les clés Stripe

Ce guide vous explique étape par étape comment obtenir toutes les clés nécessaires pour configurer Stripe dans votre application.

---

## 📋 Liste des clés nécessaires

Vous aurez besoin de :
1. **STRIPE_SECRET_KEY** (clé secrète API)
2. **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY** (clé publique)
3. **STRIPE_WEBHOOK_SECRET** (secret du webhook)
4. **STRIPE_PRICE_ID** (ID du prix de votre produit)
5. **STRIPE_LOOKUP_KEY** (optionnel, alternative au PRICE_ID)

---

## 🔐 Étape 1 : Obtenir les clés API (Secret Key et Publishable Key)

### 1.1 Se connecter à Stripe

1. Allez sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. Connectez-vous à votre compte Stripe

### 1.2 Accéder aux clés API

1. Dans le menu de gauche, cliquez sur **"Developers"** (Développeurs)
2. Cliquez sur **"API keys"** (Clés API)

### 1.3 Récupérer les clés

Vous verrez deux sections :

#### **Publishable key** (Clé publique)
- Commence par `pk_test_` (mode test) ou `pk_live_` (mode production)
- **Copiez cette clé** → C'est votre `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

#### **Secret key** (Clé secrète)
- Commence par `sk_test_` (mode test) ou `sk_live_` (mode production)
- ⚠️ **Cliquez sur "Reveal test key"** ou "Reveal live key" pour la voir
- **Copiez cette clé** → C'est votre `STRIPE_SECRET_KEY`

⚠️ **Important** : 
- Utilisez les clés **test** (`_test_`) pour le développement
- Utilisez les clés **live** (`_live_`) uniquement en production

---

## 💰 Étape 2 : Créer un produit et obtenir le Price ID

### 2.1 Créer un produit dans Stripe

1. Dans le menu de gauche, cliquez sur **"Products"** (Produits)
2. Cliquez sur **"Add product"** (Ajouter un produit)

### 2.2 Configurer le produit

1. **Nom du produit** : `Naeliv PRO`
2. **Description** : `Abonnement mensuel Naeliv PRO`
3. **Prix** :
   - Montant : `6.05`
   - Devise : `EUR` (ou votre devise)
   - **Type de facturation** : Sélectionnez **"Recurring"** (Récurrent)
   - **Intervalle** : `Monthly` (Mensuel)
4. Cliquez sur **"Save product"** (Enregistrer)

### 2.3 Obtenir le Price ID

1. Une fois le produit créé, vous verrez la page de détails du produit
2. Dans la section **"Pricing"**, vous verrez le prix que vous venez de créer
3. **Le Price ID** commence par `price_` (ex: `price_1234567890abcdef`)
4. **Copiez ce Price ID** → C'est votre `STRIPE_PRICE_ID`

### 2.4 (Optionnel) Créer un Lookup Key

Si vous préférez utiliser un `lookup_key` au lieu du `price_id` :

1. Sur la page du produit, cliquez sur le prix
2. Dans les paramètres du prix, trouvez **"Lookup key"**
3. Ajoutez une clé (ex: `naeliv_pro_monthly`)
4. **Copiez cette clé** → C'est votre `STRIPE_LOOKUP_KEY`

---

## 🔔 Étape 3 : Configurer le Webhook et obtenir le Webhook Secret

### 3.1 Créer un endpoint webhook

1. Dans le menu de gauche, cliquez sur **"Developers"** (Développeurs)
2. Cliquez sur **"Webhooks"** (Webhooks)
3. Cliquez sur **"Add endpoint"** (Ajouter un endpoint)

### 3.2 Configurer l'URL du webhook

1. **Endpoint URL** : Entrez l'URL de votre webhook
   - **En développement local** : Utilisez Stripe CLI (voir section 3.5)
   - **En production** : `https://votre-domaine.com/api/stripe/webhook`
   
   Exemple : `https://naeliv.com/api/stripe/webhook`

2. **Description** (optionnel) : `Webhook pour les abonnements Naeliv PRO`

3. Cliquez sur **"Add endpoint"**

### 3.3 Sélectionner les événements à écouter

Après avoir créé l'endpoint, vous devez sélectionner les événements :

1. Cliquez sur **"Select events"** ou **"Add events"**
2. Sélectionnez ces événements :
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `customer.subscription.trial_will_end`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `entitlements.active_entitlement_summary.updated` (optionnel)

3. Cliquez sur **"Add events"**

### 3.4 Obtenir le Webhook Secret

1. Une fois l'endpoint créé, cliquez dessus dans la liste
2. Dans la section **"Signing secret"**, vous verrez un secret qui commence par `whsec_`
3. Cliquez sur **"Reveal"** pour le voir
4. **Copiez ce secret** → C'est votre `STRIPE_WEBHOOK_SECRET`

⚠️ **Important** : Ce secret est différent pour chaque endpoint webhook !

### 3.5 (Optionnel) Tester localement avec Stripe CLI

Pour tester les webhooks en local :

1. **Installer Stripe CLI** :
   ```bash
   # Windows (avec Chocolatey)
   choco install stripe
   
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Linux
   # Voir https://stripe.com/docs/stripe-cli
   ```

2. **Se connecter** :
   ```bash
   stripe login
   ```

3. **Écouter les webhooks** :
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. **Copier le webhook secret** :
   - Stripe CLI affichera un secret qui commence par `whsec_`
   - **Utilisez ce secret** pour `STRIPE_WEBHOOK_SECRET` en développement local

---

## 📝 Étape 4 : Ajouter les clés dans votre projet

### 4.1 Fichier `.env.local` (développement)

Créez ou modifiez votre fichier `.env.local` à la racine du projet :

```env
# Stripe - Clés API
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Stripe - Webhook
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Stripe - Produit
STRIPE_PRICE_ID=price_xxxxxxxxxxxxx
# OU (si vous utilisez lookup_key)
# STRIPE_LOOKUP_KEY=naeliv_pro_monthly

# URL de l'application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4.2 Variables d'environnement en production (Vercel/Netlify)

1. **Vercel** :
   - Allez dans votre projet → **Settings** → **Environment Variables**
   - Ajoutez chaque variable une par une

2. **Netlify** :
   - Allez dans votre site → **Site settings** → **Environment variables**
   - Ajoutez chaque variable

⚠️ **Important** : 
- Utilisez les clés **test** en développement
- Utilisez les clés **live** en production
- Ne partagez JAMAIS vos clés secrètes publiquement

---

## ✅ Étape 5 : Vérifier la configuration

### 5.1 Tester la création d'une session

1. Démarrez votre serveur de développement : `npm run dev`
2. Allez sur votre page de paiement
3. Cliquez sur "Payer avec Stripe"
4. Vous devriez être redirigé vers Stripe Checkout

### 5.2 Tester les webhooks

1. **En local** : Utilisez Stripe CLI (voir section 3.5)
2. **En production** : 
   - Dans Stripe Dashboard → Webhooks
   - Cliquez sur votre endpoint
   - Allez dans l'onglet **"Events"**
   - Vous verrez les événements reçus

---

## 🔍 Résumé : Où trouver chaque clé

| Clé | Où la trouver |
|-----|--------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Dashboard → Developers → API keys → Publishable key |
| `STRIPE_SECRET_KEY` | Dashboard → Developers → API keys → Secret key (cliquer sur "Reveal") |
| `STRIPE_WEBHOOK_SECRET` | Dashboard → Developers → Webhooks → Votre endpoint → Signing secret (cliquer sur "Reveal") |
| `STRIPE_PRICE_ID` | Dashboard → Products → Votre produit → Pricing → Price ID (commence par `price_`) |
| `STRIPE_LOOKUP_KEY` | Dashboard → Products → Votre produit → Prix → Lookup key (optionnel) |

---

## 🆘 Dépannage

### Je ne vois pas le Webhook Secret

1. Assurez-vous d'avoir créé l'endpoint webhook
2. Cliquez sur l'endpoint dans la liste
3. Cherchez la section **"Signing secret"**
4. Cliquez sur **"Reveal"** ou **"Click to reveal"**

### Je ne trouve pas le Price ID

1. Allez dans **Products** → Votre produit
2. Dans la section **"Pricing"**, cliquez sur le prix
3. Le Price ID est visible dans l'URL ou dans les détails du prix
4. Il commence toujours par `price_`

### Les webhooks ne fonctionnent pas

1. Vérifiez que l'URL du webhook est correcte
2. Vérifiez que `STRIPE_WEBHOOK_SECRET` correspond au secret de l'endpoint
3. Vérifiez les logs dans Stripe Dashboard → Webhooks → Votre endpoint → Events
4. Vérifiez les logs de votre application

---

## 📚 Ressources

- [Documentation Stripe - API Keys](https://stripe.com/docs/keys)
- [Documentation Stripe - Webhooks](https://stripe.com/docs/webhooks)
- [Documentation Stripe - Products & Prices](https://stripe.com/docs/products-prices/overview)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)

