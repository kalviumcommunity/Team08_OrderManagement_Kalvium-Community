export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth-helper";
import { broadcastSSE } from "@/lib/sse";

/**
 * POST /api/products/restock
 * Increments product stock, validates against max storage capacity (maxStock),
 * creates an inventory log, and broadcasts SSE updates.
 * Restricted to OWNER and MANAGER roles.
 */
export async function POST(req) {
  try {
    // 1. Authenticate user
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Validate user role
    const allowedRoles = ["OWNER", "MANAGER"];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // 3. Parse input body
    const { productId, quantity } = await req.json();

    if (!productId || typeof quantity !== "number" || quantity <= 0) {
      return NextResponse.json(
        {
          error: "Valid productId and quantity are required",
        },
        { status: 400 }
      );
    }

    // 4. Retrieve existing product
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // 5. Ensure restocking does not exceed maximum stock capacity
    const availableSpace = product.maxStock - product.stock;

    if (quantity > availableSpace) {
      return NextResponse.json(
        {
          error: `Cannot add ${quantity}. Only ${availableSpace} storage space available.`,
        },
        { status: 400 }
      );
    }

    // 6. Execute stock increment and log creation in transaction
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

    // 7. Broadcast real-time stock update
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
