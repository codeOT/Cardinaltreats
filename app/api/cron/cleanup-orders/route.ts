import { NextRequest, NextResponse } from "next/server";
import { purgeStaleUnpaidOrders } from "@/lib/orders";

/**
 * Removes abandoned pending checkouts and failed-payment cancelled rows (no paidAt).
 * Schedule via Vercel Cron / external ping with Authorization: Bearer CRON_SECRET
 */
export async function POST(req: NextRequest) {
  return runCleanup(req);
}

export async function GET(req: NextRequest) {
  return runCleanup(req);
}

function runCleanup(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 503 }
    );
  }

  const auth = req.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const q = req.nextUrl.searchParams.get("secret") || "";
  if (bearer !== secret && q !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pendingMaxAgeMs =
    Number(process.env.CLEANUP_PENDING_ORDER_MAX_AGE_MS) || 72 * 60 * 60 * 1000;

  return purgeStaleUnpaidOrders(pendingMaxAgeMs).then((counts) =>
    NextResponse.json({ ok: true, ...counts, pendingMaxAgeMs })
  );
}
