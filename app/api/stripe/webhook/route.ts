import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { getStripeClient } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/server';

/**
 * Stripe Webhook Handler
 *
 * Handles subscription lifecycle events from Stripe:
 * - checkout.session.completed: Initial subscription creation
 * - customer.subscription.created: Subscription activated
 * - customer.subscription.updated: Plan changes
 * - customer.subscription.deleted: Cancellation
 * - invoice.payment_failed: Payment issues
 */

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  console.log(`Received Stripe webhook: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook ${event.type}:`, error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.supabase_user_id;
  const tier = session.metadata?.tier;

  if (!userId || !tier) {
    console.error('Missing user ID or tier in checkout session metadata');
    return;
  }

  const supabase = await createClient();

  // Get subscription details
  const subscriptionId = session.subscription as string;

  console.log(`Checkout completed for user ${userId}, tier: ${tier}, subscription: ${subscriptionId}`);

  // Update user subscription status
  const { error } = await supabase
    .from('users')
    .update({
      subscription_tier: tier as 'free' | 'basic' | 'premium',
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: session.customer as string,
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }

  console.log(`User ${userId} subscription updated to ${tier}`);
}

/**
 * Handle subscription creation or update
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.supabase_user_id;
  const tier = subscription.metadata?.tier;

  if (!userId) {
    console.error('Missing user ID in subscription metadata');
    return;
  }

  const supabase = await createClient();

  // Determine current status
  let subscriptionTier = 'free';
  if (subscription.status === 'active' || subscription.status === 'trialing') {
    subscriptionTier = tier || 'basic';
  }

  console.log(`Subscription ${subscription.id} updated: status=${subscription.status}, tier=${subscriptionTier}`);

  // Update user subscription status
  const { error } = await supabase
    .from('users')
    .update({
      subscription_tier: subscriptionTier as 'free' | 'basic' | 'premium',
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }

  console.log(`User ${userId} subscription updated to ${subscriptionTier}`);
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.supabase_user_id;

  if (!userId) {
    console.error('Missing user ID in subscription metadata');
    return;
  }

  const supabase = await createClient();

  console.log(`Subscription ${subscription.id} deleted for user ${userId}`);

  // Downgrade user to free tier
  const { error } = await supabase
    .from('users')
    .update({
      subscription_tier: 'free',
      stripe_subscription_id: null,
    })
    .eq('id', userId);

  if (error) {
    console.error('Error downgrading user to free tier:', error);
    throw error;
  }

  console.log(`User ${userId} downgraded to free tier`);
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  console.log(`Payment failed for customer ${customerId}, invoice ${invoice.id}`);

  // Note: We don't immediately downgrade on first payment failure
  // Stripe will retry the payment automatically
  // If payment ultimately fails, subscription.deleted event will be triggered

  // TODO: Send email notification to user about payment failure
  // This could be implemented in US-016 (notification system)
}
