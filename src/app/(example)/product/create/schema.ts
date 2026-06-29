import { z } from "zod";

export const productCreateSchema = z.object({
  // Details Section
  productName: z.string().min(1, "Product name is required"),
  subDescription: z.string().optional(),
  content: z.string().optional(),
  images: z.array(z.string()).optional(),

  // Properties Section
  productCode: z.string().optional(),
  productSKU: z.string().optional(),
  quantity: z.coerce.number().min(0, "Quantity must be 0 or greater").default(0),
  category: z.string().min(1, "Category is required"),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  tags: z.string().optional(),
  gender: z.object({
    men: z.boolean().default(false),
    women: z.boolean().default(false),
    kids: z.boolean().default(false),
  }),
  saleLabel: z.object({
    enabled: z.boolean().default(false),
    text: z.string().optional(),
  }),
  newLabel: z.object({
    enabled: z.boolean().default(false),
    text: z.string().optional(),
  }),

  // Pricing Section
  regularPrice: z.coerce.number().min(0, "Regular price must be 0 or greater"),
  salePrice: z.coerce.number().min(0, "Sale price must be 0 or greater").optional(),
  priceIncludesTaxes: z.boolean().default(false),
  taxPercent: z.coerce.number().min(0).max(100).optional(),
});

export type ProductCreateFormData = z.infer<typeof productCreateSchema>;

export const defaultValues: Partial<ProductCreateFormData> = {
  productName: "",
  subDescription: "",
  content: "",
  images: [],
  productCode: "",
  productSKU: "",
  quantity: 0,
  category: "t-shirts",
  colors: [],
  sizes: [],
  tags: "",
  gender: {
    men: false,
    women: false,
    kids: false,
  },
  saleLabel: {
    enabled: false,
    text: "",
  },
  newLabel: {
    enabled: false,
    text: "",
  },
  regularPrice: 0,
  salePrice: 0,
  priceIncludesTaxes: false,
  taxPercent: 0,
};
