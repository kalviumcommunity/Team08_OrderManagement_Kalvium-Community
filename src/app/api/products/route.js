import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth-helper";
import { updateStock } from "@/lib/services/inventory-service";
import { broadcastSSE } from "@/lib/sse";

// GET: List all products and their current stock
export async function GET(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("GET products error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: Direct inventory stock adjustments (restricted to OWNER and MANAGER)
export async function PATCH(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["OWNER", "MANAGER"];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { productId, changeAmount, reason } = await req.json();

    if (!productId || typeof changeAmount !== "number") {
      return NextResponse.json(
        { error: "productId and changeAmount (number) are required" },
        { status: 400 }
      );
    }

    const result = await updateStock(productId, user.id, changeAmount, reason);

    // Broadcast SSE update for stock change
    broadcastSSE("STOCK_UPDATED", {
      productId,
      stock: result.product.stock,
      log: result.log,
    });

    return NextResponse.json(
      {
        message: "Product stock updated successfully",
        product: result.product,
        log: result.log,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH products error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 400 }
    );
  }
}
