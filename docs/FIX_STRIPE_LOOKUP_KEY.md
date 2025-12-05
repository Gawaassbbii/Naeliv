# 🔧 Fix : Erreur STRIPE_LOOKUP_KEY

## ❌ Erreur
```
STRIPE_PRICE_ID ou STRIPE_LOOKUP_KEY doit être configuré
```

## ✅ Solution

Ajoutez la variable `STRIPE_LOOKUP_KEY` dans votre fichier `.env.local` à la racine du projet.

### Étape 1 : Ouvrir le fichier `.env.local`

Le fichier se trouve à la racine de votre projet : `klar-mail/.env.local`

### Étape 2 : Ajouter la variable

Ajoutez cette ligne dans votre fichier `.env.local` :

```env
STRIPE_LOOKUP_KEY=naeliv_pro_monthly
```

### Étape 3 : Vérifier votre fichier `.env.local` complet

Votre fichier `.env.local` devrait contenir au minimum :

```env
# Stripe - Clés API
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Stripe - Webhook
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Stripe - Produit Abonnement (utilise lookup_key)
STRIPE_LOOKUP_KEY=naeliv_pro_monthly

# URL de l'application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Étape 4 : Redémarrer le serveur de développement

⚠️ **Important** : Après avoir modifié `.env.local`, vous devez **redémarrer votre serveur de développement** pour que les changements soient pris en compte.

1. Arrêtez le serveur (Ctrl+C dans le terminal)
2. Redémarrez avec `npm run dev`

## 🔍 Vérification

Une fois la variable ajoutée et le serveur redémarré, l'erreur devrait disparaître et le bouton "Payer avec Stripe" devrait fonctionner correctement.

## 📝 Note

- Le `lookup_key` `naeliv_pro_monthly` correspond à votre produit d'abonnement mensuel Naeliv PRO dans Stripe
- Si vous préférez utiliser un `price_id` directement, vous pouvez utiliser `STRIPE_PRICE_ID` à la place (mais pas les deux en même temps)

