# Stripe Checkout Patterns

Complete guide for implementing Stripe Checkout in Next.js.

## One-Time Payments

### Server-Side API Route

```typescript
// app/api/checkout/route.ts
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
    const { priceId, quantity = 1 } = await request.json();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity,
        },
      ],
      success_url: `${request.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/pricing`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### Client Component

```typescript
// components/CheckoutButton.tsx
'use client';

import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';
import { Button } from '@/components/ui';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface CheckoutButtonProps {
  priceId: string;
  label?: string;
}

export function CheckoutButton({ priceId, label = 'Buy Now' }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error('Stripe redirect error:', error);
        alert(error.message);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleCheckout} disabled={loading}>
      {loading ? 'Loading...' : label}
    </Button>
  );
}
```

## Subscription Checkout

```typescript
// app/api/checkout/subscription/route.ts
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
    const { priceId } = await request.json();

    // Check if customer already exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          userId: user.id,
        },
      });

      customerId = customer.id;

      // Save customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${request.headers.get('origin')}/dashboard?success=true`,
      cancel_url: `${request.headers.get('origin')}/pricing`,
      subscription_data: {
        metadata: {
          userId: user.id,
        },
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Subscription checkout error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

## Success Page

```typescript
// app/success/page.tsx
import { stripe } from '@/lib/stripe/server';
import { redirect } from 'next/navigation';

interface PageProps {
  searchParams: {
    session_id?: string;
  };
}

export default async function SuccessPage({ searchParams }: PageProps) {
  const sessionId = searchParams.session_id;

  if (!sessionId) {
    redirect('/');
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  return (
    <div>
      <h1>Payment Successful!</h1>
      <p>Thank you for your purchase.</p>
      <p>Order ID: {session.id}</p>
      <p>Amount: ${(session.amount_total! / 100).toFixed(2)}</p>
    </div>
  );
}
```

## Embedded Checkout

```typescript
// components/EmbeddedCheckout.tsx
'use client';

import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export function EmbeddedCheckoutForm({ clientSecret }: { clientSecret: string }) {
  return (
    <EmbeddedCheckoutProvider
      stripe={stripePromise}
      options={{ clientSecret }}
    >
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
}
```

```typescript
// app/api/checkout/embedded/route.ts
import { stripe } from '@/lib/stripe/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { priceId } = await request.json();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      ui_mode: 'embedded',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      return_url: `${request.headers.get('origin')}/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

## Checkout with Coupons

```typescript
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  line_items: [{ price: priceId, quantity: 1 }],
  allow_promotion_codes: true, // Allow users to enter promo codes
  discounts: [
    {
      coupon: 'SUMMER2024', // Pre-applied coupon
    },
  ],
  success_url: `${origin}/success`,
  cancel_url: `${origin}/pricing`,
});
```

## Checkout with Trial Period

```typescript
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  line_items: [{ price: priceId, quantity: 1 }],
  subscription_data: {
    trial_period_days: 14,
    trial_settings: {
      end_behavior: {
        missing_payment_method: 'cancel',
      },
    },
  },
  success_url: `${origin}/success`,
  cancel_url: `${origin}/pricing`,
});
```

## Custom Checkout Fields

```typescript
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: [{ price: priceId, quantity: 1 }],
  custom_fields: [
    {
      key: 'company',
      label: {
        type: 'custom',
        custom: 'Company name',
      },
      type: 'text',
    },
    {
      key: 'purchase_order',
      label: {
        type: 'custom',
        custom: 'Purchase Order Number',
      },
      type: 'text',
      optional: true,
    },
  ],
  success_url: `${origin}/success`,
  cancel_url: `${origin}/pricing`,
});
```

## Tax Calculation

```typescript
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: [{ price: priceId, quantity: 1 }],
  automatic_tax: {
    enabled: true,
  },
  customer_update: {
    address: 'auto',
  },
  success_url: `${origin}/success`,
  cancel_url: `${origin}/pricing`,
});
```
