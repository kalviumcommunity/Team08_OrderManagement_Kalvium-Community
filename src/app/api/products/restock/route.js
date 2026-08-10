import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth-helper";
import { broadcastSSE } from "@/lib/sse";

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const allowedRoles = ["OWNER", "MANAGER"];

    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { productId, quantity } = await req.json();

    if (!productId || typeof quantity !== "number" || quantity <= 0) {
      return NextResponse.json(
        {
          error: "Valid productId and quantity are required",
        },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const availableSpace = product.maxStock - product.stock;

    if (quantity > availableSpace) {
      return NextResponse.json(
        {
          error: `Cannot add ${quantity}. Only ${availableSpace} storage space available.`,
        },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          stock: {
            increment: quantity,
          },
        },
      });

      const log = await tx.inventoryLog.create({
        data: {
          productId,
          ownerId: user.id,
          previousQuantity: product.stock,
          newQuantity: updatedProduct.stock,
          changeAmount: quantity,
          reason: "Product restocked",
        },
      });

      return {
        product: updatedProduct,
        log,
      };
    });

    broadcastSSE("STOCK_UPDATED", {
      productId,
      stock: result.product.stock,
      log: result.log,
    });

    return NextResponse.json(
      {
        message: "Product restocked successfully",
        product: result.product,
        log: result.log,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST restock error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to restock product",
      },
      { status: 500 }
    );
  }
}
