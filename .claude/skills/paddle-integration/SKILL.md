---
name: paddle-integration
version: 1.0.0
description: Paddle payment and subscription integration for SaaS tax compliance
priority: medium
dependencies: []
triggers:
  keywords: [paddle, paddle.js, paddle billing, saas billing, tax compliance]
  files: ["**/paddle/**/*.ts", "**/lib/paddle/**"]
  intents: ["paddle setup", "paddle checkout", "paddle subscription"]
---

# Paddle Integration Skill

> Paddle SaaS 支付和税务合规集成

## 🎯 Setup

```bash
pnpm add @paddle/paddle-js
```

```env
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=test_...
PADDLE_API_KEY=...
```

## 📦 Client-Side Checkout

```typescript
'use client';

import { initializePaddle, Paddle } from '@paddle/paddle-js';
import { useEffect, useState } from 'react';

export function CheckoutButton({ priceId }: { priceId: string }) {
  const [paddle, setPaddle] = useState<Paddle>();

  useEffect(() => {
    initializePaddle({
      environment: 'sandbox',
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
    }).then(setPaddle);
  }, []);

  const openCheckout = () => {
    paddle?.Checkout.open({
      items: [{ priceId, quantity: 1 }],
    });
  };

  return <button onClick={openCheckout}>Buy Now</button>;
}
```

## 🔧 Webhook Handler

```typescript
// app/api/webhooks/paddle/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  // Verify webhook signature
  // Handle event

  switch (body.event_type) {
    case 'subscription.created':
      await handleSubscriptionCreated(body.data);
      break;
    case 'subscription.updated':
      await handleSubscriptionUpdated(body.data);
      break;
  }

  return NextResponse.json({ success: true });
}
```

## 📚 Documentation

- [Paddle Docs](https://developer.paddle.com/)
- [Paddle.js Reference](https://developer.paddle.com/paddlejs/overview)
