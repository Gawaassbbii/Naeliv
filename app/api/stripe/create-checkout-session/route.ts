import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer le type de produit depuis le body (abonnement ou alias)
    const body = await request.json().catch(() => ({}));
    const productType = body.productType || 'subscription'; // 'subscription' ou 'alias'

    // Récupérer le profil utilisateur
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profil utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const email = profile.email || user.email!;

    // Créer ou récupérer le client Stripe
    let customerId: string;
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (subscription?.stripe_customer_id) {
      customerId = subscription.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
    }

    // Déterminer le lookup_key selon le type de produit
    let lookupKey: string;
    let mode: 'subscription' | 'payment';
    
    if (productType === 'alias') {
      // Achat d'alias (one-time payment)
      lookupKey = process.env.STRIPE_LOOKUP_KEY_ALIAS || 'naeliv_life_username';
      mode = 'payment';
    } else {
      // Abonnement PRO (subscription)
      lookupKey = process.env.STRIPE_LOOKUP_KEY || 'naeliv_pro_monthly';
      mode = 'subscription';
    }

    // Vérifier si un priceId est fourni directement
    const priceId = body.priceId || process.env.STRIPE_PRICE_ID;

    let priceToUse: string;

    if (priceId) {
      // Si priceId est fourni, l'utiliser directement
      priceToUse = priceId;
    } else if (lookupKey) {
      // Sinon, récupérer le prix via lookup_key
      const prices = await stripe.prices.list({
        lookup_keys: [lookupKey],
        expand: ['data.product'],
      });

      if (!prices.data.length) {
        return NextResponse.json(
          { error: `Prix Stripe non trouvé pour le lookup_key: ${lookupKey}` },
          { status: 500 }
        );
      }

      priceToUse = prices.data[0].id;
    } else {
      return NextResponse.json(
        { error: 'STRIPE_LOOKUP_KEY ou STRIPE_LOOKUP_KEY_ALIAS doit être configuré, ou fournir un priceId' },
        { status: 500 }
      );
    }

    // Créer la session de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: mode,
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      line_items: [
        {
          price: priceToUse,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/paiement/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/paiement`,
      metadata: {
        userId: user.id,
        productType: productType, // Enregistrer le type de produit dans les métadonnées
      },
      allow_promotion_codes: mode === 'subscription', // Codes promo uniquement pour les abonnements
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('❌ [STRIPE] Erreur lors de la création de la session:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    );
  }
}

