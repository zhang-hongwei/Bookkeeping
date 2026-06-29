import { z } from 'zod';

/**
 * Plan type enum
 */
export const PlanTypeEnum = z.enum(['pay_as_you_go', 'monthly', 'enterprise']);
export type PlanType = z.infer<typeof PlanTypeEnum>;

/**
 * Address schema for billing address
 */
export const addressSchema = z.object({
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State/Province is required'),
  zip: z.string().min(3, 'ZIP/Postal code is required'),
  country: z.string().min(2, 'Country is required'),
});

export type Address = z.infer<typeof addressSchema>;

/**
 * Payment method schema
 */
export const paymentMethodSchema = z.object({
  id: z.string(),
  type: z.enum(['card', 'paypal']),
  card: z
    .object({
      brand: z.string(),
      last4: z.string(),
      exp_month: z.number(),
      exp_year: z.number(),
    })
    .optional(),
  is_default: z.boolean(),
});

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

/**
 * Plan information schema
 */
export const planSchema = z.object({
  type: PlanTypeEnum,
  name: z.string(),
  price_per_1k: z.number(),
  currency: z.string(),
});

export type Plan = z.infer<typeof planSchema>;

/**
 * API Key schema
 */
export const apiKeySchema = z.object({
  key: z.string(),
  created_at: z.string(),
});

export type ApiKey = z.infer<typeof apiKeySchema>;

/**
 * Usage statistics schema
 */
export const usageSchema = z.object({
  requests_remaining: z.number(),
  requests_used: z.number(),
  reset_date: z.string().optional(),
});

export type Usage = z.infer<typeof usageSchema>;

/**
 * Auto top-up configuration schema
 */
export const autoTopUpSchema = z.object({
  enabled: z.boolean(),
  threshold: z.number().min(10).optional(),
  amount: z.number().min(10).optional(),
});

export type AutoTopUp = z.infer<typeof autoTopUpSchema>;

/**
 * Billing information schema
 */
export const billingSchema = z.object({
  address: addressSchema.nullable(),
  payment_method: paymentMethodSchema.nullable(),
  billing_emails: z.array(z.string().email()).max(3),
});

export type Billing = z.infer<typeof billingSchema>;

/**
 * User information schema
 */
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  created_at: z.string(),
});

export type User = z.infer<typeof userSchema>;

/**
 * Complete account response schema
 */
export const accountResponseSchema = z.object({
  user: userSchema,
  plan: planSchema,
  api_key: apiKeySchema,
  usage: usageSchema,
  auto_top_up: autoTopUpSchema,
  billing: billingSchema,
});

export type AccountResponse = z.infer<typeof accountResponseSchema>;

/**
 * Billing emails update schema
 */
export const billingEmailsUpdateSchema = z.object({
  emails: z
    .array(z.string().email('Invalid email address'))
    .max(3, 'Maximum 3 billing emails allowed'),
});

export type BillingEmailsUpdate = z.infer<typeof billingEmailsUpdateSchema>;

/**
 * Invoice schema
 */
export const invoiceSchema = z.object({
  id: z.string(),
  invoice_number: z.string(),
  date: z.string(),
  due_date: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum(['paid', 'pending', 'overdue']),
  pdf_url: z.string(),
  line_items: z.array(
    z.object({
      description: z.string(),
      quantity: z.number(),
      unit_price: z.number(),
      total: z.number(),
    })
  ),
});

export type Invoice = z.infer<typeof invoiceSchema>;
