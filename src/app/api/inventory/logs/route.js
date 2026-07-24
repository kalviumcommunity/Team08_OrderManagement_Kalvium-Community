import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-helper";
import { listInventoryLogs } from "@/lib/services/inventory-service";

// GET: Retrieve inventory audit logs (Owner, Manager, Auditor only)
export async function GET(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["OWNER", "MANAGER", "AUDITOR"];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const logs = await listInventoryLogs();

    return NextResponse.json({ logs }, { status: 200 });
  } catch (error) {
    console.error("GET inventory logs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
