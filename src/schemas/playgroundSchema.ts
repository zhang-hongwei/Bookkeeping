import { z } from 'zod';

export const playgroundFormSchema = z
  .object({
    type: z.string().min(1, 'Type is required'),
    amazonDomain: z.string().min(1, 'Amazon domain is required'),
    url: z.string().url('Invalid URL format').optional().or(z.literal('')),
    asin: z
      .string()
      .regex(/^[A-Z0-9]{10}$/, 'ASIN must be 10 alphanumeric characters')
      .optional()
      .or(z.literal('')),
    gtin: z.string().optional().or(z.literal('')),
    includeSummarizationAttributes: z.boolean().nullable().optional(),
    variantPrices: z.boolean().nullable().optional(),
    language: z.string().optional().or(z.literal('')),
    associateId: z.string().optional().or(z.literal('')),
    output: z.string().optional().or(z.literal('')),
    includeHtml: z.boolean().nullable().optional(),
  })
  .refine(
    (data) => {
      // At least one of URL, ASIN, or GTIN must be provided
      return data.url || data.asin || data.gtin;
    },
    {
      message: 'Please provide at least one of: URL, ASIN, or GTIN',
      path: ['url'], // Show error on URL field
    }
  );

export type PlaygroundFormData = z.infer<typeof playgroundFormSchema>;
