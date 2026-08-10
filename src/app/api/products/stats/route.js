export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth-helper";

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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
