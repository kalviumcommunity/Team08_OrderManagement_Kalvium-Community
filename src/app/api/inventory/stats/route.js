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

    const products = await prisma.product.findMany();

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

    return NextResponse.json({
      totalProducts,
      inStock,
      lowStock,
      outOfStock,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );

  }
}
