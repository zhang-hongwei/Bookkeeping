---
name: stripe-integration
version: 1.0.0
description: Stripe payment, subscription, and webhook integration best practices
priority: high
dependencies: []
triggers:
  keywords: [stripe, payment, checkout, subscription, invoice, webhook, customer, price, product]
  files: ["**/stripe/**/*.ts", "src/lib/stripe.ts", "src/app/api/stripe/**", "src/app/api/webhooks/stripe/**"]
  intents: ["setup stripe", "create payment", "handle subscription", "process webhook"]
---

# Stripe Integration Skill

> Stripe 支付、订阅、Webhook 集成最佳实践

## 🎯 Core Principles

### 1. Stripe Client Initialization

```typescript
// src/lib/stripe/client.ts
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});
```

### 2. Environment Variables

```env
# .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 📦 Common Patterns

### Checkout Session

```typescript
// app/api/checkout/route.ts
import { stripe } from '@/lib/stripe/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { priceId, userId } = await request.json();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${request.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/cancel`,
      metadata: {
        userId,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
```

### Client-Side Checkout

```typescript
// components/CheckoutButton.tsx
'use client';

import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function CheckoutButton({ priceId }: { priceId: string }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, userId: 'user-id' }),
    });

    const { sessionId } = await response.json();
    const stripe = await stripePromise;

    const { error } = await stripe!.redirectToCheckout({ sessionId });

    if (error) {
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <button onClick={handleCheckout} disabled={loading}>
      {loading ? 'Loading...' : 'Checkout'}
    </button>
  );
}
```

### Subscription Creation

```typescript
// app/api/subscriptions/route.ts
import { stripe } from '@/lib/stripe/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, priceId, userId } = await request.json();

    // Create or retrieve customer
    let customer = await stripe.customers.list({ email, limit: 1 });

    if (customer.data.length === 0) {
      customer.data[0] = await stripe.customers.create({
        email,
        metadata: { userId },
      });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.data[0].id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any).payment_intent.client_secret,
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
```

### Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { stripe } from '@/lib/stripe/client';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;

    case 'customer.subscription.created':
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCreated(subscription);
      break;

    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(updatedSubscription);
      break;

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(deletedSubscription);
      break;

    case 'invoice.paid':
      const invoice = event.data.object as Stripe.Invoice;
      await handleInvoicePaid(invoice);
      break;

    case 'invoice.payment_failed':
      const failedInvoice = event.data.object as Stripe.Invoice;
      await handleInvoicePaymentFailed(failedInvoice);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id);
  // Update your database
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id);
  // Update your database
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);
  // Update your database
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);
  // Update your database
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log('Invoice paid:', invoice.id);
  // Update your database
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id);
  // Notify user
}
```

### Customer Management

```typescript
// Create customer
const customer = await stripe.customers.create({
  email: 'customer@example.com',
  name: 'John Doe',
  metadata: {
    userId: 'user-123',
  },
});

// Update customer
await stripe.customers.update(customer.id, {
  name: 'Jane Doe',
});

// Delete customer
await stripe.customers.del(customer.id);

// List customers
const customers = await stripe.customers.list({
  limit: 10,
});
```

### Product and Price Management

```typescript
// Create product
const product = await stripe.products.create({
  name: 'Pro Plan',
  description: 'Professional subscription plan',
});

// Create price
const price = await stripe.prices.create({
  product: product.id,
  unit_amount: 2000, // $20.00
  currency: 'usd',
  recurring: {
    interval: 'month',
  },
});

// Create one-time price
const oneTimePrice = await stripe.prices.create({
  product: product.id,
  unit_amount: 9900, // $99.00
  currency: 'usd',
});
```

## 🔒 Security Best Practices

### 1. Never Expose Secret Keys

```typescript
// ✅ Good: Server-side only
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ❌ Bad: Client-side exposure
// Never use secret key in client components
```

### 2. Always Verify Webhooks

```typescript
// ✅ Good: Verify signature
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  webhookSecret
);

// ❌ Bad: Trust payload without verification
const event = JSON.parse(body);
```

### 3. Use Idempotency Keys

```typescript
// Prevent duplicate charges
const charge = await stripe.charges.create(
  {
    amount: 2000,
    currency: 'usd',
    source: 'tok_visa',
  },
  {
    idempotencyKey: 'unique-key-for-this-charge',
  }
);
```

## 📚 Resources

See the `resources/` directory for detailed guides on:
- `checkout.md` - Checkout session patterns
- `subscriptions.md` - Subscription management
- `webhooks.md` - Webhook handling best practices
- `customer-portal.md` - Customer portal integration

## 🚫 Common Pitfalls

1. **Not handling webhooks** - Always implement webhook handlers
2. **Using test keys in production** - Separate test and live keys
3. **Not verifying webhook signatures** - Security risk
4. **Storing sensitive data** - Never store full card numbers
5. **Not handling failed payments** - Implement retry logic

## 📖 Official Documentation

- [Stripe Docs](https://stripe.com/docs)
- [Next.js Integration](https://stripe.com/docs/payments/quickstart)
- [Webhook Guide](https://stripe.com/docs/webhooks)
