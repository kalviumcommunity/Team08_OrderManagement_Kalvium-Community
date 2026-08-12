export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth-helper";

/**
 * GET /api/products/stats
 * Aggregates statistics regarding inventory stock levels:
 * - totalProducts: Total number of distinct items
 * - inStock: Items above the low stock threshold
 * - lowStock: Items at or below the low stock threshold
 * - outOfStock: Items with zero quantity remaining
 */
export async function GET(req) {
  try {
    // 1. Authenticate user
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Fetch product count and stock levels
    const totalProducts = await prisma.product.count();

    const products = await prisma.product.findMany({
      select: {
        stock: true,
        lowStockThreshold: true,
      },
    });

    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    // 3. Classify each product based on stock thresholds
    products.forEach((product) => {
      if (product.stock === 0) {
        outOfStock++;
      } else if (product.stock <= product.lowStockThreshold) {
        lowStock++;
      } else {
        inStock++;
      }
    });

    return NextResponse.json({
      totalProducts,
      inStock,
      lowStock,
      outOfStock,
    });
  } catch (error) {
    console.error("GET inventory stats error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
