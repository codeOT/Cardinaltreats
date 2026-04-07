import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { requireFullAdmin } from "@/lib/admin";
import type { Product } from "@/types";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  const { ok } = await requireFullAdmin();
  if (!ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = Number(idStr);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const patch = await req.json().catch(() => null);
  if (!patch || typeof patch !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const allowed: (keyof Product)[] = [
    "slug",
    "name",
    "subtitle",
    "price",
    "weight",
    "badge",
    "tagline",
    "dotColor",
    "emoji",
    "description",
    "tags",
    "twBg",
    "twText",
    "twBorder",
    "twAccentBg",
    "imageUrl",
    "price50",
    "price100",
    "stockQty",
    "stockQty50",
    "stockQty100",
  ];

  const $set: Partial<Product> = {};
  for (const key of allowed) {
    if (patch[key] !== undefined) ($set as any)[key] = patch[key];
  }

  const productsCol = await getCollection<Product>("products");
  await productsCol.updateOne({ id }, { $set: $set as any });
  const product = await productsCol.findOne({ id });
  return NextResponse.json({ product });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  const { ok } = await requireFullAdmin();
  if (!ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = Number(idStr);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const productsCol = await getCollection<Product>("products");
  await productsCol.deleteOne({ id });
  return NextResponse.json({ success: true });
}

