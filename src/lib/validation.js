import { z } from "zod";

/**
 * Validation Schema for User Registration
 * Enforces field presence, string length, valid email formatting, and permitted roles.
 */
export const registerSchema = z.object({
  name: z.string().min(1, "Owner name is required"),
  restaurantName: z.string().min(1, "Restaurant name is required"),
  phone: z.string().min(10, "Phone number is required"),
  businessType: z.string().min(1, "Business type is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z
    .enum(["CUSTOMER", "OWNER", "MANAGER", "AUDITOR"])
    .optional(),
});

/**
 * Validation Schema for Individual Order Items
 * Requires a valid product UUID and positive integer quantity.
 */
export const orderItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID format"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
});

/**
 * Validation Schema for Order Creation
 * Requires an optional customer name and an array of at least 1 valid order item.
 */
export const orderSchema = z.object({
  customerName: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});
