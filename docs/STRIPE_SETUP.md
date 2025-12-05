# 💳 Configuration Stripe pour les Paiements

Ce guide vous explique comment configurer Stripe pour gérer les paiements récurrents (abonnements) dans votre application Naeliv.

📖 **Pour un guide détaillé sur comment obtenir toutes les clés Stripe, consultez** : [`GUIDE_OBTENIR_CLES_STRIPE.md`](./GUIDE_OBTENIR_CLES_STRIPE.md)

## 📋 Vue d'ensemble

1. **Créer un compte Stripe** et obtenir les clés API
2. **Installer le package Stripe** dans votre projet
3. **Configurer les variables d'environnement**
4. **Créer les API routes** pour gérer les paiements
5. **Mettre à jour la page de paiement** pour utiliser Stripe
6. **Configurer les webhooks** pour synchroniser les abonnements

---

## 🚀 Étape 1 : Créer un compte Stripe

1. Allez sur [stripe.com](https://stripe.com) et créez un compte
2. Une fois connecté, allez dans **Developers** → **API keys**
3. Copiez vos clés :
   - **Publishable key** (commence par `pk_test_` ou `pk_live_`)
   - **Secret key** (commence par `sk_test_` ou `sk_live_`)

⚠️ **Important** : Utilisez les clés de **test** (`_test_`) pour le développement et les clés **live** (`_live_`) pour la production.

---

## 📦 Étape 2 : Installer le package Stripe

Dans votre terminal, exécutez :

```bash
npm install stripe @stripe/stripe-js
```

---

## 🔐 Étape 3 : Variables d'environnement

Ajoutez ces variables dans votre fichier `.env.local` (développement) ou dans Vercel/Netlify (production) :

```env
# Stripe - Clés API
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Stripe - Webhook
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Stripe - Produit (choisissez UNE des deux options)
STRIPE_PRICE_ID=price_xxxxxxxxxxxxx
# OU (si vous utilisez lookup_key)
# STRIPE_LOOKUP_KEY=naeliv_pro_monthly

# URL de votre application
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Dev
# NEXT_PUBLIC_APP_URL=https://votre-domaine.com  # Production
```

### Comment obtenir chaque clé

#### 1. Clés API (Publishable Key et Secret Key)
1. Dashboard Stripe → **Developers** → **API keys**
2. **Publishable key** : Copiez la clé qui commence par `pk_test_` ou `pk_live_`
3. **Secret key** : Cliquez sur **"Reveal test key"** ou **"Reveal live key"** et copiez la clé qui commence par `sk_test_` ou `sk_live_`

#### 2. Price ID
1. Dashboard Stripe → **Products** → Créez un produit "Naeliv PRO"
2. Configurez le prix : 5€, récurrent, mensuel
3. Une fois créé, le **Price ID** commence par `price_` (visible dans les détails du produit)

#### 3. Webhook Secret
Voir la section "Obtenir le Webhook Secret" ci-dessus.

### Obtenir le Webhook Secret

1. Dans Stripe Dashboard, allez dans **Developers** → **Webhooks**
2. Cliquez sur **Add endpoint** (ou "Create endpoint")
3. **Endpoint URL** : Entrez l'URL de votre webhook
   - **En production** : `https://votre-domaine.com/api/stripe/webhook`
   - **En développement local** : Utilisez Stripe CLI (voir ci-dessous)
4. Cliquez sur **"Add endpoint"** ou **"Continue"**
5. **Sélectionnez les événements** :
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `customer.subscription.trial_will_end`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
6. Cliquez sur **"Add events"** puis **"Add endpoint"**
7. **Une fois l'endpoint créé**, cliquez dessus dans la liste
8. Dans la section **"Signing secret"**, cliquez sur **"Reveal"** ou **"Click to reveal"**
9. **Copiez le secret** qui commence par `whsec_` → C'est votre `STRIPE_WEBHOOK_SECRET`

⚠️ **Important** : Le webhook secret est différent pour chaque endpoint. Si vous créez un nouvel endpoint, vous obtiendrez un nouveau secret.

### Tester localement avec Stripe CLI

Pour tester les webhooks en développement local :

1. **Installer Stripe CLI** :
   ```bash
   # Windows (avec Chocolatey)
   choco install stripe
   
   # macOS
   brew install stripe/stripe-cli/stripe
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
   - **Utilisez ce secret** pour `STRIPE_WEBHOOK_SECRET` dans votre `.env.local`

---

## 🛠️ Étape 4 : Créer les API Routes

### 4.1 Route pour créer une session de checkout

Créez `app/api/stripe/create-checkout-session/route.ts` :

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { user_id, email } = await request.json();

    if (!user_id || !email) {
      return NextResponse.json(
        { error: 'user_id et email sont requis' },
        { status: 400 }
      );
    }

    // Créer ou récupérer le client Stripe
    let customerId: string;
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user_id)
      .single();

    if (subscription?.stripe_customer_id) {
      customerId = subscription.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email,
        metadata: { user_id },
      });
      customerId = customer.id;
    }

    // Créer la session de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Naeliv PRO',
              description: 'Abonnement mensuel Naeliv PRO',
            },
            recurring: {
              interval: 'month',
            },
            unit_amount: 500, // 5€ en centimes
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/paiement/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/paiement`,
      metadata: {
        user_id,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Erreur Stripe:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### 4.2 Route pour gérer les webhooks

Créez `app/api/stripe/webhook/route.ts` :

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Erreur de signature webhook:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;

        if (userId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          // Créer ou mettre à jour l'abonnement dans Supabase
          await supabaseAdmin
            .from('subscriptions')
            .upsert({
              user_id: userId,
              plan: 'pro',
              status: subscription.status === 'active' ? 'active' : 'trialing',
              stripe_subscription_id: subscription.id,
              stripe_customer_id: subscription.customer as string,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end || false,
            }, {
              onConflict: 'user_id'
            });

          // Mettre à jour le plan dans profiles
          await supabaseAdmin
            .from('profiles')
            .update({ plan: 'pro' })
            .eq('id', userId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: subscription.status === 'active' ? 'active' : 'cancelled',
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end || false,
            })
            .eq('stripe_subscription_id', subscription.id);

          // Si l'abonnement est annulé, remettre le plan à essential
          if (subscription.status === 'canceled') {
            await supabaseAdmin
              .from('profiles')
              .update({ plan: 'essential' })
              .eq('id', userId);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'cancelled' })
            .eq('stripe_subscription_id', subscription.id);

          await supabaseAdmin
            .from('profiles')
            .update({ plan: 'essential' })
            .eq('id', userId);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'active' })
            .eq('stripe_subscription_id', subscriptionId);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', subscriptionId);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Erreur lors du traitement du webhook:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Désactiver le body parsing pour Stripe
export const runtime = 'nodejs';
```

---

## 🎨 Étape 5 : Mettre à jour la page de paiement

Mettez à jour `app/paiement/page.tsx` pour utiliser Stripe Checkout au lieu du formulaire manuel.

---

## ✅ Étape 6 : Tester

### Mode Test

1. Utilisez les cartes de test Stripe :
   - **Succès** : `4242 4242 4242 4242`
   - **Échec** : `4000 0000 0000 0002`
   - Date d'expiration : n'importe quelle date future
   - CVC : n'importe quel 3 chiffres

2. Testez le flux complet :
   - Création de la session
   - Paiement avec carte de test
   - Vérification dans Stripe Dashboard
   - Vérification dans Supabase

---

## 🔍 Dépannage

### Le webhook ne fonctionne pas

1. Vérifiez que l'URL du webhook est correcte dans Stripe
2. Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct
3. Utilisez Stripe CLI pour tester localement :
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

### Les abonnements ne se synchronisent pas

1. Vérifiez les logs dans Stripe Dashboard → Webhooks
2. Vérifiez les logs de votre application
3. Vérifiez que les événements sont bien sélectionnés dans Stripe

---

## 📚 Ressources

- [Documentation Stripe](https://stripe.com/docs)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)

