import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

async function setupStripeProducts() {
  console.log('🚀 Setting up Stripe products and prices...\n');

  try {
    // ============================================
    // BASIC PLAN
    // ============================================
    console.log('📦 Creating Basic plan product...');
    const basicProduct = await stripe.products.create({
      name: 'Myndset Basic',
      description: '10 personalized meditations per month with premium features',
      metadata: {
        tier: 'basic',
        meditations_limit: '10',
        remixes_limit: '10',
      },
    });
    console.log(`✓ Basic product created: ${basicProduct.id}\n`);

    // Basic Monthly Price
    console.log('💰 Creating Basic monthly price ($9/month)...');
    const basicMonthly = await stripe.prices.create({
      product: basicProduct.id,
      unit_amount: 900, // $9.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        tier: 'basic',
        billing_period: 'monthly',
      },
    });
    console.log(`✓ Basic monthly price created: ${basicMonthly.id}`);
    console.log(`   Add to .env: STRIPE_PRICE_ID_BASIC_MONTHLY=${basicMonthly.id}\n`);

    // Basic Annual Price
    console.log('💰 Creating Basic annual price ($90/year - save $18)...');
    const basicAnnual = await stripe.prices.create({
      product: basicProduct.id,
      unit_amount: 9000, // $90.00 in cents (2 months free)
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      metadata: {
        tier: 'basic',
        billing_period: 'annual',
      },
    });
    console.log(`✓ Basic annual price created: ${basicAnnual.id}`);
    console.log(`   Add to .env: STRIPE_PRICE_ID_BASIC_ANNUAL=${basicAnnual.id}\n`);

    // ============================================
    // PREMIUM PLAN
    // ============================================
    console.log('📦 Creating Premium plan product...');
    const premiumProduct = await stripe.products.create({
      name: 'Myndset Premium',
      description: '45 personalized meditations per month with all premium features',
      metadata: {
        tier: 'premium',
        meditations_limit: '45',
        remixes_limit: '999',
      },
    });
    console.log(`✓ Premium product created: ${premiumProduct.id}\n`);

    // Premium Monthly Price
    console.log('💰 Creating Premium monthly price ($19/month)...');
    const premiumMonthly = await stripe.prices.create({
      product: premiumProduct.id,
      unit_amount: 1900, // $19.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        tier: 'premium',
        billing_period: 'monthly',
      },
    });
    console.log(`✓ Premium monthly price created: ${premiumMonthly.id}`);
    console.log(`   Add to .env: STRIPE_PRICE_ID_PREMIUM_MONTHLY=${premiumMonthly.id}\n`);

    // Premium Annual Price
    console.log('💰 Creating Premium annual price ($190/year - save $38)...');
    const premiumAnnual = await stripe.prices.create({
      product: premiumProduct.id,
      unit_amount: 19000, // $190.00 in cents (2 months free)
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      metadata: {
        tier: 'premium',
        billing_period: 'annual',
      },
    });
    console.log(`✓ Premium annual price created: ${premiumAnnual.id}`);
    console.log(`   Add to .env: STRIPE_PRICE_ID_PREMIUM_ANNUAL=${premiumAnnual.id}\n`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('✅ All Stripe products and prices created successfully!\n');
    console.log('📋 Summary:');
    console.log('─────────────────────────────────────────────────────');
    console.log('Basic Plan:');
    console.log(`  Product ID: ${basicProduct.id}`);
    console.log(`  Monthly Price ID: ${basicMonthly.id}`);
    console.log(`  Annual Price ID: ${basicAnnual.id}`);
    console.log('');
    console.log('Premium Plan:');
    console.log(`  Product ID: ${premiumProduct.id}`);
    console.log(`  Monthly Price ID: ${premiumMonthly.id}`);
    console.log(`  Annual Price ID: ${premiumAnnual.id}`);
    console.log('─────────────────────────────────────────────────────\n');

    console.log('🔑 Add these environment variables to your .env.local file:');
    console.log('');
    console.log(`STRIPE_PRICE_ID_BASIC_MONTHLY=${basicMonthly.id}`);
    console.log(`STRIPE_PRICE_ID_BASIC_ANNUAL=${basicAnnual.id}`);
    console.log(`STRIPE_PRICE_ID_PREMIUM_MONTHLY=${premiumMonthly.id}`);
    console.log(`STRIPE_PRICE_ID_PREMIUM_ANNUAL=${premiumAnnual.id}`);
    console.log('');

    console.log('🌐 Next steps:');
    console.log('1. Add the price IDs to your .env.local file');
    console.log('2. Test checkout flow in test mode');
    console.log('3. Set up webhook endpoint for subscription events');
    console.log('4. Switch to live mode when ready for production');
  } catch (error) {
    console.error('❌ Error setting up Stripe products:', error);
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

setupStripeProducts();
