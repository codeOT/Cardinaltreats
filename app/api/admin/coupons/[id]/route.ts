import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import type { Coupon } from "@/types";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const allowed: (keyof Coupon)[] = [
    "description",
    "discountPercent",
    "maxUses",
    "active",
    "validFrom",
    "validTo",
  ];

  const $set: Partial<Coupon> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) ($set as any)[key] = body[key];
  }

  const col = await getCollection<Coupon>("coupons");
  await col.updateOne(
    { _id: new ObjectId(params.id) as any },
    { $set: $set as any }
  );
  const updated = await col.findOne({
    _id: new ObjectId(params.id) as any,
  });

  return NextResponse.json({
    coupon: { ...(updated as any), _id: String((updated as any)._id) },
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const col = await getCollection<Coupon>("coupons");
  await col.deleteOne({ _id: new ObjectId(params.id) as any });
  return NextResponse.json({ success: true });
}

