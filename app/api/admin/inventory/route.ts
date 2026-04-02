import { NextResponse } from "next/server";
import { getAdminOrderSummary } from "@/lib/orders";
import { getCollection } from "@/lib/db";
import { requireFullAdmin } from "@/lib/admin";
import type { Coupon } from "@/types";

export async function GET() {
  const { ok } = await requireFullAdmin();
  if (!ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const summary = await getAdminOrderSummary();
  const couponsCol = await getCollection<Coupon>("coupons");
  const coupons = await couponsCol.find({}).toArray();

  return NextResponse.json({
    summary,
    coupons: coupons.map((c) => ({ ...c, _id: String(c._id) })),
  });
}

