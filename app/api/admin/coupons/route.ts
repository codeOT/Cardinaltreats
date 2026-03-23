import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import type { Coupon } from "@/types";

export async function GET() {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const col = await getCollection<Coupon>("coupons");
  const coupons = await col.find({}).sort({ code: 1 }).toArray();
  return NextResponse.json({
    coupons: coupons.map((c) => ({ ...c, _id: String((c as any)._id) })),
  });
}

export async function POST(req: Request) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.code || !body?.discountPercent) {
    return NextResponse.json(
      { error: "Code and discountPercent are required" },
      { status: 400 }
    );
  }

  const col = await getCollection<Coupon>("coupons");
  const code = String(body.code).trim().toUpperCase();

  const existing = await col.findOne({ code });
  if (existing) {
    return NextResponse.json({ error: "Code already exists" }, { status: 400 });
  }

  const coupon: Coupon = {
    code,
    description: body.description ? String(body.description) : undefined,
    discountPercent: Number(body.discountPercent),
    maxUses: body.maxUses != null ? Number(body.maxUses) : undefined,
    usedCount: 0,
    active: body.active ?? true,
    validFrom: body.validFrom ? String(body.validFrom) : undefined,
    validTo: body.validTo ? String(body.validTo) : undefined,
  };

  const res = await col.insertOne(coupon as any);
  return NextResponse.json({
    coupon: { ...coupon, _id: String(res.insertedId) },
  });
}

