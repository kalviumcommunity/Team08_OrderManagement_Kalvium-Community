import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth-helper";
import { broadcastSSE } from "@/lib/sse";
import { orderSchema } from "@/lib/validation";
import { isRateLimited, getClientKey } from "@/lib/rate-limiter";

/**
 * GET /api/orders
 * Retrieves paginated list of orders with optional status and customer name filters.
 * Restricted to OWNER, MANAGER, and AUDITOR roles.
 */
export async function GET(req) {
  try {
    // 1. Authenticate user
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate user role
    const allowedRoles = ["OWNER", "MANAGER", "AUDITOR"];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. Extract query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));

    const skip = (page - 1) * limit;

    // 4. Construct filter conditions
    const where = {};
    if (status) {
      where.status = status.toUpperCase();
    }
    if (search) {
      where.customerName = {
        contains: search,
      };
    }

    // 5. Query count and paginated records
    const totalCount = await prisma.order.count({ where });
    const totalPages = Math.ceil(totalCount / limit);

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    }, { status: 200 });
  } catch (error) {
    console.error("GET orders error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/orders
 * Creates a new order atomically within a database transaction:
 * - Validates stock availability for each line item
 * - Decrements stock quantities
 * - Creates inventory deduction logs
 * - Creates the Order and OrderItem records
 * - Dispatches real-time SSE notifications (ORDER_CREATED, LOW_STOCK_ALERT)
 */
export async function POST(req) {
  try {
    // 1. Rate limiting check (10 requests/min)
    const ipKey = getClientKey(req, "order");
    if (isRateLimited(ipKey, 10, 60000)) {
      return NextResponse.json(
        { error: "Too many order requests. Please try again in a minute." },
        { status: 429 }
      );
    }

    // 2. Authentication check
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Parse and validate request body schema
    const body = await req.json();
    const validation = orderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    const { items, customerName } = validation.data;
    const finalCustomerName = customerName || user.name || "Walk-in Customer";
    const lowStockAlerts = [];

    // 4. Execute atomic database transaction
    const result = await prisma.$transaction(async (tx) => {
      const orderItemsToCreate = [];

      for (const item of items) {
        const { productId, quantity } = item;

        if (!productId || typeof quantity !== "number" || quantity <= 0) {
          throw new Error("Invalid product ID or quantity");
        }

        // Fetch product and verify available stock
        const product = await tx.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          throw new Error(`Product not found: ${productId}`);
        }

        if (product.stock < quantity) {
          throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock}`);
        }

        // Atomically decrement stock
        const updatedProduct = await tx.product.update({
          where: { id: productId },
          data: { stock: { decrement: quantity } },
        });

        // Trigger low stock alert if threshold reached
        if (updatedProduct.stock < updatedProduct.lowStockThreshold) {
          lowStockAlerts.push({
            productId: updatedProduct.id,
            name: updatedProduct.name,
            stock: updatedProduct.stock,
            lowStockThreshold: updatedProduct.lowStockThreshold,
          });
        }

        // Record stock deduction log
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

      // Create new Order with nested OrderItems
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

    // 5. Broadcast real-time SSE event for order creation
    broadcastSSE("ORDER_CREATED", result);

    // 6. Broadcast real-time alerts for products reaching low stock
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
