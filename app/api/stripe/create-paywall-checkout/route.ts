import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialiser Stripe
function getStripe() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY n\'est pas configuré');
  }
  return new Stripe(stripeKey, {
    apiVersion: '2025-11-17.clover',
  });
}

// Initialiser Supabase Admin
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Variables d\'environnement Supabase manquantes');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const supabaseAdmin = getSupabaseAdmin();

    const body = await request.json();
    const { emailId, recipientUserId, senderEmail } = body;

    if (!emailId || !recipientUserId || !senderEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: emailId, recipientUserId, senderEmail' },
        { status: 400 }
      );
    }

    // Récupérer le profil du destinataire pour obtenir le prix du timbre
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('paywall_price, email')
      .eq('id', recipientUserId)
      .single();

    if (profileError || !profile) {
      console.error('❌ [PAYWALL CHECKOUT] Erreur lors de la récupération du profil:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch recipient profile' },
        { status: 500 }
      );
    }

    const stampPrice = profile.paywall_price || 10; // Par défaut 0,10€ (10 centimes)
    const recipientEmail = profile.email;

    // Créer une session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Timbre de sécurité Naeliv',
              description: `Paiement pour délivrer votre email à ${recipientEmail}`,
            },
            unit_amount: stampPrice, // Prix en centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://naeliv.com'}/paywall-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://naeliv.com'}/paywall-cancel`,
      metadata: {
        email_id: emailId,
        recipient_user_id: recipientUserId,
        sender_email: senderEmail,
        productType: 'paywall_stamp', // Identifier ce type de paiement
      },
    });

    console.log(`✅ [PAYWALL CHECKOUT] Session créée pour email ${emailId}, montant: ${stampPrice / 100}€`);

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error('❌ [PAYWALL CHECKOUT] Erreur:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

