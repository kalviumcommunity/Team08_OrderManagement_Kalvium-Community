import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth-helper";
import { broadcastSSE } from "@/lib/sse";

// GET: Retrieve all active orders (sorted by creation time)
export async function GET(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only OWNER, MANAGER, or AUDITOR roles can list all orders
    const allowedRoles = ["OWNER", "MANAGER", "AUDITOR"];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("GET orders error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Place a new order (with transaction-based stock decrement)
export async function POST(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items, customerName } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items array is required" }, { status: 400 });
    }

    const finalCustomerName = customerName || user.name || "Walk-in Customer";

    const lowStockAlerts = [];

    // Run transaction
    const result = await prisma.$transaction(async (tx) => {
      const orderItemsToCreate = [];

      for (const item of items) {
        const { productId, quantity } = item;

        if (!productId || typeof quantity !== "number" || quantity <= 0) {
          throw new Error("Invalid product ID or quantity");
        }

        // Fetch product and lock the row (or check stock)
        const product = await tx.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          throw new Error(`Product not found: ${productId}`);
        }

        if (product.stock < quantity) {
          throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock}`);
        }

        // Decrement product stock
        const updatedProduct = await tx.product.update({
          where: { id: productId },
          data: { stock: { decrement: quantity } },
        });

        if (updatedProduct.stock < updatedProduct.lowStockThreshold) {
          lowStockAlerts.push({
            productId: updatedProduct.id,
            name: updatedProduct.name,
            stock: updatedProduct.stock,
            lowStockThreshold: updatedProduct.lowStockThreshold,
          });
        }

        // Add log entry
        await tx.inventoryLog.create({
          data: {
            productId,
            previousQuantity: product.stock,
            newQuantity: updatedProduct.stock,
            changeAmount: -quantity,
            reason: `Order placed by ${finalCustomerName}`,
          },
        });

        orderItemsToCreate.push({
          productId,
          quantity,
        });
      }

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          customerName: finalCustomerName,
          status: "PENDING",
          items: {
            create: orderItemsToCreate,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      return newOrder;
    });

    // Broadcast SSE update
    broadcastSSE("ORDER_CREATED", result);

    // Broadcast low stock alerts
    for (const alert of lowStockAlerts) {
      console.log(`[Low-Stock Alert] Product ${alert.name} (${alert.productId}) is low on stock! Current: ${alert.stock}, Threshold: ${alert.lowStockThreshold}`);
      broadcastSSE("LOW_STOCK_ALERT", alert);
    }

    return NextResponse.json(
      { message: "Order placed successfully", order: result },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST orders error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 400 }
    );
  }
}
