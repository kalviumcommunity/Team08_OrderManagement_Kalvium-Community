import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Owner name is required"),
  restaurantName: z.string().min(1, "Restaurant name is required"),
  phone: z.string().min(10, "Phone number is required"),
  businessType: z.string().min(1, "Business type is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6),
  role: z
    .enum(["CUSTOMER", "OWNER", "MANAGER", "AUDITOR"])
    .optional(),
});

export const orderItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID format"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
});

export const orderSchema = z.object({
  customerName: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});
