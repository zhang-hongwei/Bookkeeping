# Stripe Subscription Management

Complete guide for managing subscriptions with Stripe.

## Create Subscription

```typescript
// app/api/subscriptions/create/route.ts
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { priceId, customerId } = await request.json();

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any).payment_intent.client_secret,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## Update Subscription

```typescript
// Upgrade/downgrade plan
await stripe.subscriptions.update(subscriptionId, {
  items: [
    {
      id: subscription.items.data[0].id,
      price: newPriceId,
    },
  ],
  proration_behavior: 'create_prorations',
});

// Change quantity
await stripe.subscriptions.update(subscriptionId, {
  items: [
    {
      id: subscription.items.data[0].id,
      quantity: 5,
    },
  ],
});
```

## Cancel Subscription

```typescript
// Cancel at period end
await stripe.subscriptions.update(subscriptionId, {
  cancel_at_period_end: true,
});

// Cancel immediately
await stripe.subscriptions.cancel(subscriptionId);

// Cancel with prorated refund
await stripe.subscriptions.cancel(subscriptionId, {
  prorate: true,
});
```

## Pause Subscription

```typescript
// Pause subscription
await stripe.subscriptions.update(subscriptionId, {
  pause_collection: {
    behavior: 'mark_uncollectible',
  },
});

// Resume subscription
await stripe.subscriptions.update(subscriptionId, {
  pause_collection: null,
});
```

## Trial Period

```typescript
// Create subscription with trial
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  trial_period_days: 14,
});

// Extend trial
await stripe.subscriptions.update(subscriptionId, {
  trial_end: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days from now
});
```

## Metered Billing

```typescript
// Create metered price
const price = await stripe.prices.create({
  product: productId,
  currency: 'usd',
  recurring: {
    interval: 'month',
    usage_type: 'metered',
  },
  billing_scheme: 'per_unit',
  unit_amount: 100, // $1.00 per unit
});

// Report usage
await stripe.subscriptionItems.createUsageRecord(
  subscriptionItemId,
  {
    quantity: 100,
    timestamp: Math.floor(Date.now() / 1000),
  }
);
```

## Multiple Plans

```typescript
// Create subscription with multiple items
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [
    { price: 'price_basic' },
    { price: 'price_addon1' },
    { price: 'price_addon2' },
  ],
});
```

## Subscription Schedules

```typescript
// Create subscription schedule
const schedule = await stripe.subscriptionSchedules.create({
  customer: customerId,
  start_date: 'now',
  end_behavior: 'release',
  phases: [
    {
      items: [{ price: 'price_starter', quantity: 1 }],
      iterations: 3, // 3 months
    },
    {
      items: [{ price: 'price_pro', quantity: 1 }],
      // runs indefinitely after trial
    },
  ],
});
```

## Database Integration

```sql
-- subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

```typescript
// Update database on webhook
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = createClient();

  await supabase
    .from('subscriptions')
    .upsert({
      user_id: subscription.metadata.userId,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      stripe_price_id: subscription.items.data[0].price.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    });
}
```
