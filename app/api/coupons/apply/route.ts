import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import type { Coupon } from "@/types";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const codeRaw = body?.code as string | undefined;
  if (!codeRaw) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const code = codeRaw.trim().toUpperCase();
  const coupons = await getCollection<Coupon>("coupons");
  const now = new Date();

  const coupon = await coupons.findOne({ code, active: true });
  if (!coupon) {
    return NextResponse.json({ valid: false, error: "Invalid coupon" }, { status: 200 });
  }

  if (coupon.validFrom && new Date(coupon.validFrom) > now) {
    return NextResponse.json({ valid: false, error: "Coupon not yet valid" }, { status: 200 });
  }
  if (coupon.validTo && new Date(coupon.validTo) < now) {
    return NextResponse.json({ valid: false, error: "Coupon expired" }, { status: 200 });
  }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ valid: false, error: "Coupon limit reached" }, { status: 200 });
  }

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    discountPercent: coupon.discountPercent,
  });
}

