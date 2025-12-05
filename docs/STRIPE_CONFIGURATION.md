# ⚙️ Configuration Stripe - Informations du Projet

Ce document contient les informations spécifiques de configuration Stripe pour ce projet.

## 📦 Produits Stripe

### 1. Abonnement Naeliv PRO
- **Produit ID** : `prod_TY5dPaliVmkqwx`
- **Lookup Key** : `naeliv_pro_monthly`
- **Type** : Abonnement récurrent mensuel
- **Prix** : 6.05€/mois
- **Usage** : Abonnement mensuel pour passer au plan PRO

### 2. Achat d'alias (Username)
- **Produit ID** : `prod_TY5gKLg0C9RTdc`
- **Lookup Key** : `naeliv_life_username`
- **Type** : Achat unique (one-time payment)
- **Usage** : Pour l'achat d'un nom d'utilisateur personnalisé (à implémenter)

---

## 🔑 Variables d'environnement requises

Ajoutez ces variables dans votre `.env.local` :

```env
# Stripe - Clés API
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Stripe - Webhook
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Stripe - Produit Abonnement (utilise lookup_key)
STRIPE_LOOKUP_KEY=naeliv_pro_monthly

# Stripe - Produit Achat Alias (one-time payment)
STRIPE_LOOKUP_KEY_ALIAS=naeliv_life_username

# URL de l'application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ✅ Configuration actuelle

Le code utilise actuellement :
- ✅ `STRIPE_LOOKUP_KEY=naeliv_pro_monthly` pour l'abonnement PRO
- ✅ Le webhook est configuré et fonctionnel
- ⏳ Le produit d'achat d'alias (`naeliv_life_username`) est prêt mais pas encore utilisé dans l'application

---

## 📝 Notes importantes

1. **Lookup Key vs Price ID** :
   - Le code supporte les deux méthodes
   - Si `STRIPE_PRICE_ID` est défini, il sera utilisé en priorité
   - Sinon, le code utilise `STRIPE_LOOKUP_KEY` pour récupérer le prix

2. **Produit d'achat d'alias** :
   - Le produit `naeliv_life_username` est configuré dans Stripe
   - Il faudra créer une route API séparée pour gérer cet achat unique
   - Ce n'est pas encore implémenté dans l'application

3. **Webhook** :
   - Assurez-vous que le webhook secret correspond à l'endpoint créé dans Stripe
   - Les événements suivants sont gérés :
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `customer.subscription.trial_will_end`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

