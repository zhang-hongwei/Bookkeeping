---
name: email-service
version: 1.0.0
description: Email sending with Resend and NodeMailer integration
priority: medium
dependencies: []
triggers:
  keywords: [email, resend, nodemailer, send email, transactional email]
  files: ["**/email/**/*.ts", "**/lib/email/**"]
  intents: ["send email", "email template", "resend setup"]
---

# Email Service Skill

> Resend 和 NodeMailer 邮件发送集成

## 🎯 Resend (Recommended)

### Setup

```bash
pnpm add resend
```

```env
RESEND_API_KEY=re_...
```

### Basic Usage

```typescript
// lib/email/resend.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const { data, error } = await resend.emails.send({
    from: 'noreply@yourdomain.com',
    to,
    subject,
    html,
  });

  if (error) throw error;
  return data;
}
```

### Email Templates

```typescript
// lib/email/templates/welcome.tsx
import { Html, Button, Container } from '@react-email/components';

export function WelcomeEmail({ name }: { name: string }) {
  return (
    <Html>
      <Container>
        <h1>Welcome, {name}!</h1>
        <p>Thanks for signing up.</p>
        <Button href="https://yourdomain.com/dashboard">
          Get Started
        </Button>
      </Container>
    </Html>
  );
}
```

```typescript
// Usage
import { render } from '@react-email/render';
import { WelcomeEmail } from './templates/welcome';

await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: render(WelcomeEmail({ name: 'John' })),
});
```

## 📦 NodeMailer

```bash
pnpm add nodemailer
pnpm add -D @types/nodemailer
```

```typescript
// lib/email/nodemailer.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  });
}
```

## 🔧 Common Patterns

### Welcome Email

```typescript
export async function sendWelcomeEmail(email: string, name: string) {
  await sendEmail({
    to: email,
    subject: 'Welcome to Our Platform',
    html: render(WelcomeEmail({ name })),
  });
}
```

### Password Reset

```typescript
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `https://yourdomain.com/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Reset Your Password',
    html: `<a href="${resetUrl}">Reset Password</a>`,
  });
}
```

### Invoice Email

```typescript
export async function sendInvoiceEmail(email: string, invoiceData: any) {
  await sendEmail({
    to: email,
    subject: `Invoice #${invoiceData.number}`,
    html: render(InvoiceEmail(invoiceData)),
  });
}
```
