# Stripe Webhook Best Practices

Complete guide for handling Stripe webhooks securely and reliably.

## Webhook Setup

### 1. Configure Stripe CLI (Development)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 2. Configure Webhook Endpoint (Production)

Go to Stripe Dashboard → Developers → Webhooks:
- Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
- Select events to listen to
- Copy webhook signing secret

## Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { stripe } from '@/lib/stripe/client';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

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
      webhookSecret
    );
  } catch (error: any) {
    console.error('Webhook verification failed:', error.message);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle event
  try {
    await handleEvent(event);
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}
```

## Event Handlers

### Checkout Completed

```typescript
import { createClient } from '@/lib/supabase/server';

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
) {
  const supabase = createClient();

  // Record purchase
  await supabase.from('purchases').insert({
    user_id: session.metadata?.userId,
    stripe_session_id: session.id,
    amount: session.amount_total,
    currency: session.currency,
    status: 'completed',
  });

  // Send confirmation email
  await sendPurchaseConfirmation(session);
}
```

### Subscription Events

```typescript
async function handleSubscriptionCreated(
  subscription: Stripe.Subscription
) {
  const supabase = createClient();

  await supabase.from('subscriptions').insert({
    user_id: subscription.metadata.userId,
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    stripe_price_id: subscription.items.data[0].price.id,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
  });

  // Grant access
  await grantSubscriptionAccess(subscription.metadata.userId);
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
) {
  const supabase = createClient();

  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      stripe_price_id: subscription.items.data[0].price.id,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq('stripe_subscription_id', subscription.id);

  // Update access based on status
  if (subscription.status === 'active') {
    await grantSubscriptionAccess(subscription.metadata.userId);
  } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
    await revokeSubscriptionAccess(subscription.metadata.userId);
  }
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  const supabase = createClient();

  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  // Revoke access
  await revokeSubscriptionAccess(subscription.metadata.userId);
}
```

### Invoice Events

```typescript
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const supabase = createClient();

  await supabase.from('invoices').insert({
    stripe_invoice_id: invoice.id,
    stripe_customer_id: invoice.customer as string,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: 'paid',
    paid_at: new Date(invoice.status_transitions.paid_at! * 1000).toISOString(),
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const supabase = createClient();

  // Get user from customer
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', invoice.customer as string)
    .single();

  if (subscription) {
    // Send payment failed notification
    await sendPaymentFailedEmail(subscription.user_id, invoice);
  }
}
```

## Idempotency

```typescript
// Store processed events to prevent duplicate processing
async function handleEvent(event: Stripe.Event) {
  const supabase = createClient();

  // Check if event already processed
  const { data: existingEvent } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .single();

  if (existingEvent) {
    console.log('Event already processed:', event.id);
    return;
  }

  // Process event
  await processEvent(event);

  // Mark as processed
  await supabase.from('webhook_events').insert({
    stripe_event_id: event.id,
    type: event.type,
    processed_at: new Date().toISOString(),
  });
}
```

## Error Handling

```typescript
async function handleEvent(event: Stripe.Event) {
  try {
    await processEvent(event);
  } catch (error: any) {
    // Log error
    console.error('Webhook processing error:', {
      event_id: event.id,
      event_type: event.type,
      error: error.message,
    });

    // Store failed event for retry
    await supabase.from('failed_webhooks').insert({
      stripe_event_id: event.id,
      type: event.type,
      payload: event,
      error: error.message,
      retry_count: 0,
    });

    // Alert team
    await alertTeam(event, error);

    throw error; // Stripe will retry
  }
}
```

## Testing Webhooks

```typescript
// Test webhook locally
import { stripe } from '@/lib/stripe/client';

async function testWebhook() {
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    webhookSecret
  );

  await handleEvent(event);
}
```

## Webhook Events to Monitor

### Critical Events
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

### Optional Events
- `customer.created`
- `customer.updated`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.succeeded`
- `charge.failed`
