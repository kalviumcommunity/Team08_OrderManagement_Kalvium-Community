export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-helper";
import { listInventoryLogs } from "@/lib/services/inventory-service";

/**
 * GET /api/inventory/logs
 * Retrieves paginated audit logs of stock adjustments and order deductions/refunds.
 * Restricted to authenticated users with OWNER, MANAGER, or AUDITOR roles.
 */
export async function GET(req) {
  try {
    // 1. Authenticate user from request header/cookie
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Role-based access control
    const allowedRoles = ["OWNER", "MANAGER", "AUDITOR"];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. Extract query parameters for filtering and pagination
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));

    // 4. Fetch logs using inventory service
    const result = await listInventoryLogs({
      productId,
      search,
      page,
      limit,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("GET inventory logs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
