import { NextResponse } from "next/server";
import { getAdminOrderSummary } from "@/lib/orders";
import { getCollection } from "@/lib/db";
import type { Coupon } from "@/types";

export async function GET() {
  const summary = await getAdminOrderSummary();
  const couponsCol = await getCollection<Coupon>("coupons");
  const coupons = await couponsCol.find({}).toArray();

  return NextResponse.json({
    summary,
    coupons: coupons.map((c) => ({ ...c, _id: String(c._id) })),
  });
}

