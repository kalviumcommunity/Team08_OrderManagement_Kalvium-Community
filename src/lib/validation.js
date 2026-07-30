import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(["CUSTOMER", "OWNER", "MANAGER", "AUDITOR"]).optional().transform((val) => val?.toUpperCase()),
});

export const orderItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID format"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
});

export const orderSchema = z.object({
  customerName: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});
