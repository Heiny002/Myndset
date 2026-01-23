import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { getStripeClient } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/server';
import { sendPaymentFailedEmail, sendSubscriptionCanceledEmail } from '@/lib/email/payment-notifications';

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

  console.log(`Received Stripe webhook: ${event.type} (${event.id})`);

  const supabase = await createClient();

  // Check for duplicate event (idempotency)
  const { data: existingEvent } = await supabase
    .from('stripe_webhook_events')
    .select('id, status')
    .eq('id', event.id)
    .single();

  if (existingEvent) {
    console.log(`Webhook event ${event.id} already processed with status: ${existingEvent.status}`);
    return NextResponse.json({ received: true, duplicate: true });
  }

  // Log the event for idempotency and debugging
  await supabase.from('stripe_webhook_events').insert({
    id: event.id,
    type: event.type,
    created: new Date(event.created * 1000).toISOString(),
    data: event.data.object as any,
    status: 'processing',
  });

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

    // Mark event as successfully processed
    await supabase
      .from('stripe_webhook_events')
      .update({ status: 'processed', processed_at: new Date().toISOString() })
      .eq('id', event.id);

    console.log(`Successfully processed webhook ${event.type} (${event.id})`);

    return NextResponse.json({ received: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error processing webhook ${event.type} (${event.id}):`, error);

    // Mark event as failed with error details
    await supabase
      .from('stripe_webhook_events')
      .update({
        status: 'failed',
        error_message: errorMessage,
        processed_at: new Date().toISOString(),
      })
      .eq('id', event.id);

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

  // Send cancellation confirmation email
  const { data: authUser } = await supabase.auth.admin.getUserById(userId);

  if (authUser?.user?.email) {
    try {
      await sendSubscriptionCanceledEmail({
        to: authUser.user.email,
        cancellationDate: new Date().toLocaleDateString(),
      });
      console.log(`Cancellation email sent to ${authUser.user.email}`);
    } catch (emailError) {
      console.error('Error sending cancellation email:', emailError);
      // Don't throw - email failure shouldn't fail the webhook
    }
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  console.log(`Payment failed for customer ${customerId}, invoice ${invoice.id}`);

  const supabase = await createClient();

  // Find user by Stripe customer ID
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!user) {
    console.error(`User not found for customer ${customerId}`);
    return;
  }

  // Get user email from auth
  const { data: authUser } = await supabase.auth.admin.getUserById(user.id);

  if (!authUser?.user?.email) {
    console.error(`Email not found for user ${user.id}`);
    return;
  }

  // Note: We don't immediately downgrade on first payment failure
  // Stripe will retry the payment automatically
  // If payment ultimately fails, subscription.deleted event will be triggered

  // Send email notification to user about payment failure
  try {
    await sendPaymentFailedEmail({
      to: authUser.user.email,
      invoiceUrl: invoice.hosted_invoice_url || undefined,
      amountDue: invoice.amount_due / 100, // Convert cents to dollars
      nextRetryDate: invoice.next_payment_attempt
        ? new Date(invoice.next_payment_attempt * 1000).toLocaleDateString()
        : undefined,
    });
    console.log(`Payment failure email sent to ${authUser.user.email}`);
  } catch (emailError) {
    console.error('Error sending payment failure email:', emailError);
    // Don't throw - email failure shouldn't fail the webhook
  }
}
