import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialiser Stripe uniquement si la clé est disponible (évite les erreurs au build)
function getStripe() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY n\'est pas configuré');
  }
  return new Stripe(stripeKey, {
    apiVersion: '2025-11-17.clover',
  });
}

// Initialiser Supabase uniquement si les clés sont disponibles
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
  // Initialiser Stripe et Supabase au moment de la requête
  const stripe = getStripe();
  const supabaseAdmin = getSupabaseAdmin();
  
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;
  
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('❌ [STRIPE WEBHOOK] STRIPE_WEBHOOK_SECRET non configuré');
    return NextResponse.json(
      { error: 'Configuration webhook manquante' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log('✅ [STRIPE WEBHOOK] Événement reçu:', event.type);
  } catch (err: any) {
    console.error('❌ [STRIPE WEBHOOK] Erreur de signature:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    let subscription: Stripe.Subscription;
    let status: string;

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        // Récupérer userId depuis les métadonnées (peut être user_id ou userId)
        const userId = session.metadata?.userId || session.metadata?.user_id;
        const productType = session.metadata?.productType || 'subscription';

        if (!userId) {
          console.warn('⚠️ [STRIPE WEBHOOK] Pas de user_id dans les métadonnées');
          break;
        }

        // Si c'est un paiement de timbre Smart Paywall
        if (productType === 'paywall_stamp' && session.payment_status === 'paid') {
          const emailId = session.metadata?.email_id;
          const recipientUserId = session.metadata?.recipient_user_id;
          const senderEmail = session.metadata?.sender_email;
          const amountTotal = session.amount_total || 0; // Montant en centimes

          if (!emailId || !recipientUserId || !senderEmail) {
            console.error('❌ [STRIPE WEBHOOK] Métadonnées manquantes pour paywall_stamp:', { emailId, recipientUserId, senderEmail });
            break;
          }

          console.log(`💰 [STRIPE WEBHOOK] Paiement de timbre détecté - Email: ${emailId}, Montant: ${amountTotal / 100}€`);

          // Action 1 : Libérer l'email (passer de 'quarantine' à 'inbox')
          const { error: emailError } = await supabaseAdmin
            .from('emails')
            .update({ 
              status: 'inbox',
              has_paid_stamp: true
            })
            .eq('id', emailId);

          if (emailError) {
            console.error('❌ [STRIPE WEBHOOK] Erreur lors de la libération de l\'email:', emailError);
          } else {
            console.log(`✅ [STRIPE WEBHOOK] Email ${emailId} libéré et ajouté à la boîte de réception`);
          }

          // Action 2 : Ajouter l'expéditeur à la whitelist (whitelisted_senders)
          const { data: currentProfile } = await supabaseAdmin
            .from('profiles')
            .select('whitelisted_senders')
            .eq('id', recipientUserId)
            .single();

          const currentWhitelist = currentProfile?.whitelisted_senders || [];
          if (!currentWhitelist.includes(senderEmail)) {
            const updatedWhitelist = [...currentWhitelist, senderEmail];
            const { error: whitelistError } = await supabaseAdmin
              .from('profiles')
              .update({ whitelisted_senders: updatedWhitelist })
              .eq('id', recipientUserId);

            if (whitelistError) {
              console.error('❌ [STRIPE WEBHOOK] Erreur lors de l\'ajout à la whitelist:', whitelistError);
            } else {
              console.log(`✅ [STRIPE WEBHOOK] ${senderEmail} ajouté à la whitelist de ${recipientUserId}`);
            }
          }

          // Action 3 : Ajouter la commission (1%) au solde de crédits du destinataire
          const commission = Math.floor(amountTotal * 0.01); // 1% en centimes
          if (commission > 0) {
            // Récupérer le solde actuel et l'incrémenter
            const { data: profileBalance } = await supabaseAdmin
              .from('profiles')
              .select('credits_balance')
              .eq('id', recipientUserId)
              .single();

            if (profileBalance) {
              const newBalance = (profileBalance.credits_balance || 0) + commission;
              const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .update({ credits_balance: newBalance })
                .eq('id', recipientUserId);

              if (updateError) {
                console.error('❌ [STRIPE WEBHOOK] Erreur lors de la mise à jour du solde:', updateError);
              } else {
                console.log(`✅ [STRIPE WEBHOOK] Commission de ${commission / 100}€ ajoutée au solde de ${recipientUserId} (nouveau solde: ${newBalance / 100}€)`);
              }
            }

            // Enregistrer la transaction
            const { error: transactionError } = await supabaseAdmin
              .from('transactions')
              .insert({
                user_id: recipientUserId,
                amount: commission,
                source: 'paywall_commission',
                description: `Commission Smart Paywall - Email de ${senderEmail}`,
                stripe_payment_intent_id: session.payment_intent as string,
                email_id: emailId,
              });

            if (transactionError) {
              console.error('❌ [STRIPE WEBHOOK] Erreur lors de l\'enregistrement de la transaction:', transactionError);
            } else {
              console.log(`✅ [STRIPE WEBHOOK] Transaction enregistrée: ${commission / 100}€ de commission`);
            }
          }

          break;
        }

        // Si c'est un achat d'alias (one-time payment)
        if (productType === 'alias' && session.payment_status === 'paid') {
          console.log('✅ [STRIPE WEBHOOK] Achat d\'alias détecté pour user:', userId);
          
          // Mettre à jour le profil pour indiquer que l'alias a été acheté
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ alias_purchased: true })
            .eq('id', userId);

          if (profileError) {
            console.error('❌ [STRIPE WEBHOOK] Erreur lors de la mise à jour de l\'alias:', profileError);
          } else {
            console.log('✅ [STRIPE WEBHOOK] Alias acheté pour user:', userId);
          }
          break;
        }

        // Si c'est un abonnement (subscription)
        if (session.subscription) {
          const subscriptionId = typeof session.subscription === 'string' 
            ? session.subscription 
            : session.subscription.id;
          
          const subscriptionObj = await stripe.subscriptions.retrieve(subscriptionId);

          // Créer ou mettre à jour l'abonnement dans Supabase
          const periodStart = (subscriptionObj as any).current_period_start as number | null | undefined;
          const periodEnd = (subscriptionObj as any).current_period_end as number | null | undefined;

          const { error: subError } = await supabaseAdmin
            .from('subscriptions')
            .upsert({
              user_id: userId,
              plan: 'pro',
              status: subscriptionObj.status === 'active' ? 'active' : 'trialing',
              stripe_subscription_id: subscriptionObj.id,
              stripe_customer_id: typeof subscriptionObj.customer === 'string' 
                ? subscriptionObj.customer 
                : (subscriptionObj.customer as any)?.id || null,
              current_period_start: periodStart && typeof periodStart === 'number'
                ? new Date(periodStart * 1000).toISOString() 
                : null,
              current_period_end: periodEnd && typeof periodEnd === 'number'
                ? new Date(periodEnd * 1000).toISOString() 
                : null,
              cancel_at_period_end: (subscriptionObj as any).cancel_at_period_end || false,
            }, {
              onConflict: 'user_id'
            });

          if (subError) {
            console.error('❌ [STRIPE WEBHOOK] Erreur lors de la création de l\'abonnement:', subError);
          } else {
            console.log('✅ [STRIPE WEBHOOK] Abonnement créé/mis à jour pour user:', userId);
          }

          // Mettre à jour le plan dans profiles
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ plan: 'pro' })
            .eq('id', userId);

          if (profileError) {
            console.error('❌ [STRIPE WEBHOOK] Erreur lors de la mise à jour du profil:', profileError);
          } else {
            console.log('✅ [STRIPE WEBHOOK] Plan mis à jour à PRO pour user:', userId);
          }
        }
        break;
      }

      case 'customer.subscription.trial_will_end': {
        subscription = event.data.object as Stripe.Subscription;
        status = subscription.status;
        console.log(`ℹ️ [STRIPE WEBHOOK] Subscription trial will end. Status: ${status}`);
        
        // Récupérer l'utilisateur depuis l'abonnement
        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (existingSub) {
          // Notifier l'utilisateur que la période d'essai se termine bientôt
          console.log(`ℹ️ [STRIPE WEBHOOK] Trial ending soon for user: ${existingSub.user_id}`);
          // TODO: Envoyer une notification email à l'utilisateur
        }
        break;
      }

      case 'customer.subscription.deleted': {
        subscription = event.data.object as Stripe.Subscription;
        status = subscription.status;
        console.log(`ℹ️ [STRIPE WEBHOOK] Subscription deleted. Status: ${status}`);
        
        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (existingSub) {
          // Mettre à jour le statut de l'abonnement
          const { error: updateError } = await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'cancelled' })
            .eq('stripe_subscription_id', subscription.id);

          if (updateError) {
            console.error('❌ [STRIPE WEBHOOK] Erreur lors de la suppression:', updateError);
          }

          // Remettre le plan à essential
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ plan: 'essential' })
            .eq('id', existingSub.user_id);

          if (profileError) {
            console.error('❌ [STRIPE WEBHOOK] Erreur lors de la mise à jour du plan:', profileError);
          } else {
            console.log('✅ [STRIPE WEBHOOK] Plan remis à Essential pour user:', existingSub.user_id);
          }
        }
        break;
      }

      case 'customer.subscription.created': {
        subscription = event.data.object as Stripe.Subscription;
        status = subscription.status;
        console.log(`ℹ️ [STRIPE WEBHOOK] Subscription created. Status: ${status}`);
        
        // Récupérer userId depuis le customer metadata
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const userId = (customer as Stripe.Customer).metadata?.user_id || (customer as Stripe.Customer).metadata?.userId;

        if (userId) {
          // Créer l'abonnement dans Supabase
          const periodStart = (subscription as any).current_period_start as number | null | undefined;
          const periodEnd = (subscription as any).current_period_end as number | null | undefined;

          const { error: subError } = await supabaseAdmin
            .from('subscriptions')
            .upsert({
              user_id: userId,
              plan: 'pro',
              status: subscription.status === 'active' ? 'active' : 'trialing',
              stripe_subscription_id: subscription.id,
              stripe_customer_id: typeof subscription.customer === 'string' 
                ? subscription.customer 
                : (subscription.customer as any)?.id || null,
              current_period_start: periodStart && typeof periodStart === 'number'
                ? new Date(periodStart * 1000).toISOString() 
                : null,
              current_period_end: periodEnd && typeof periodEnd === 'number'
                ? new Date(periodEnd * 1000).toISOString() 
                : null,
              cancel_at_period_end: (subscription as any).cancel_at_period_end || false,
            }, {
              onConflict: 'user_id'
            });

          if (subError) {
            console.error('❌ [STRIPE WEBHOOK] Erreur lors de la création de l\'abonnement:', subError);
          } else {
            console.log('✅ [STRIPE WEBHOOK] Abonnement créé pour user:', userId);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        subscription = event.data.object as Stripe.Subscription;
        status = subscription.status;
        console.log(`ℹ️ [STRIPE WEBHOOK] Subscription updated. Status: ${status}`);
        
        // Récupérer l'utilisateur depuis l'abonnement
        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (!existingSub) {
          console.warn('⚠️ [STRIPE WEBHOOK] Abonnement non trouvé:', subscription.id);
          break;
        }

        // Mettre à jour l'abonnement
        const periodStart = (subscription as any).current_period_start as number | null | undefined;
        const periodEnd = (subscription as any).current_period_end as number | null | undefined;

        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: subscription.status === 'active' ? 'active' : 
                   subscription.status === 'canceled' ? 'cancelled' : 'past_due',
            current_period_start: periodStart && typeof periodStart === 'number'
              ? new Date(periodStart * 1000).toISOString() 
              : null,
            current_period_end: periodEnd && typeof periodEnd === 'number'
              ? new Date(periodEnd * 1000).toISOString() 
              : null,
            cancel_at_period_end: (subscription as any).cancel_at_period_end || false,
          })
          .eq('stripe_subscription_id', subscription.id);

        if (updateError) {
          console.error('❌ [STRIPE WEBHOOK] Erreur lors de la mise à jour:', updateError);
        } else {
          console.log('✅ [STRIPE WEBHOOK] Abonnement mis à jour:', subscription.id);
        }

        // Si l'abonnement est annulé, remettre le plan à essential
        if (subscription.status === 'canceled') {
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ plan: 'essential' })
            .eq('id', existingSub.user_id);

          if (profileError) {
            console.error('❌ [STRIPE WEBHOOK] Erreur lors de la mise à jour du plan:', profileError);
          } else {
            console.log('✅ [STRIPE WEBHOOK] Plan remis à Essential pour user:', existingSub.user_id);
          }
        } else if (subscription.status === 'active') {
          // Si l'abonnement est actif, s'assurer que le plan est pro
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ plan: 'pro' })
            .eq('id', existingSub.user_id);

          if (profileError) {
            console.error('❌ [STRIPE WEBHOOK] Erreur lors de la mise à jour du plan:', profileError);
          }
        }
        break;
      }

      case 'entitlements.active_entitlement_summary.updated': {
        const entitlement = event.data.object;
        console.log(`ℹ️ [STRIPE WEBHOOK] Active entitlement summary updated for ${entitlement}`);
        // TODO: Gérer les entitlements si nécessaire
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        // Accéder à subscription via l'index ou la propriété
        const subscriptionRef = (invoice as any).subscription;
        const subscriptionId = subscriptionRef
          ? (typeof subscriptionRef === 'string' 
              ? subscriptionRef 
              : subscriptionRef?.id || null)
          : null;

        if (subscriptionId) {
          const { error } = await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'active' })
            .eq('stripe_subscription_id', subscriptionId);

          if (error) {
            console.error('❌ [STRIPE WEBHOOK] Erreur lors de la mise à jour du statut:', error);
          } else {
            console.log('✅ [STRIPE WEBHOOK] Paiement réussi pour subscription:', subscriptionId);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        // Accéder à subscription via l'index ou la propriété
        const subscriptionRef = (invoice as any).subscription;
        const subscriptionId = subscriptionRef
          ? (typeof subscriptionRef === 'string' 
              ? subscriptionRef 
              : subscriptionRef?.id || null)
          : null;

        if (subscriptionId) {
          const { error } = await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', subscriptionId);

          if (error) {
            console.error('❌ [STRIPE WEBHOOK] Erreur lors de la mise à jour du statut:', error);
          } else {
            console.log('⚠️ [STRIPE WEBHOOK] Paiement échoué pour subscription:', subscriptionId);
          }
        }
        break;
      }

      default:
        console.log('ℹ️ [STRIPE WEBHOOK] Événement non géré:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('❌ [STRIPE WEBHOOK] Erreur lors du traitement:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Désactiver le body parsing pour Stripe (nécessaire pour la vérification de signature)
export const runtime = 'nodejs';

