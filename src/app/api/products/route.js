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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const lowStock = searchParams.get("lowStock") === "true";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));

    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.name = {
        contains: search,
      };
    }
    if (lowStock) {
      where.stock = {
        lt: prisma.product.fields.lowStockThreshold,
      };
    }

    const totalCount = await prisma.product.count({ where });
    const totalPages = Math.ceil(totalCount / limit);

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take: limit,
    });

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    }, { status: 200 });
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
