export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth-helper";

/**
 * GET /api/inventory/stats
 * Calculates aggregate inventory health metrics:
 * - totalProducts: Total number of catalog items
 * - inStock: Items with stock above the low-stock threshold
 * - lowStock: Items with stock > 0 but <= lowStockThreshold
 * - outOfStock: Items with zero stock
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

    // 2. Query all products from database
    const products = await prisma.product.findMany();

    // 3. Compute counts based on stock thresholds
    const totalProducts = products.length;

    const inStock = products.filter(
      (p) => p.stock > p.lowStockThreshold
    ).length;

    const lowStock = products.filter(
      (p) =>
        p.stock > 0 &&
        p.stock <= p.lowStockThreshold
    ).length;

    const outOfStock = products.filter(
      (p) => p.stock === 0
    ).length;

    // 4. Return computed stats
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
