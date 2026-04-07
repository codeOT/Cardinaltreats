import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { requireFullAdmin } from "@/lib/admin";
import type { Product } from "@/types";

export async function POST(req: Request) {
  const { ok } = await requireFullAdmin();
  if (!ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.name || body?.price50 == null || body?.price100 == null) {
    return NextResponse.json({ error: "Missing fields: name, price50, and price100 are required" }, { status: 400 });
  }

  const productsCol = await getCollection<Product>("products");
  const last = await productsCol.find({}).sort({ id: -1 }).limit(1).toArray();
  const nextId = last[0]?.id ? last[0].id + 1 : 1;

  const name = String(body.name).trim();
  const slug = body.slug
    ? String(body.slug)
    : name.toLowerCase().trim().replace(/\s+/g, "-");

  const doc: Product = {
    id: nextId,
    slug,
    name,
    subtitle: String(body.subtitle || ""),
    price: Number(body.price100 ?? body.price),
    weight: String(body.weight || "250g"),
    badge: String(body.badge || "New"),
    tagline: String(body.tagline || ""),
    dotColor: String(body.dotColor || "#D97706"),
    emoji: String(body.emoji || "🥜"),
    description: String(body.description || ""),
    tags: Array.isArray(body.tags) ? body.tags : String(body.tags || "").split(",").map((t) => t.trim()).filter(Boolean),
    twBg: String(body.twBg || "bg-amber-50"),
    twText: String(body.twText || "text-amber-700"),
    twBorder: String(body.twBorder || "border-amber-200"),
    twAccentBg: String(body.twAccentBg || "bg-amber-500"),
    imageUrl: body.imageUrl ? String(body.imageUrl) : undefined,
    price50: body.price50 != null ? Number(body.price50) : undefined,
    price100: body.price100 != null ? Number(body.price100) : undefined,
    stockQty50: body.stockQty50 != null ? Number(body.stockQty50) : undefined,
    stockQty100: body.stockQty100 != null ? Number(body.stockQty100) : undefined,
    // keep legacy field for older UI/logic
    stockQty:
      body.stockQty != null
        ? Number(body.stockQty)
        : body.stockQty50 != null || body.stockQty100 != null
          ? Number(body.stockQty50 || 0) + Number(body.stockQty100 || 0)
          : 100,
  };

  await productsCol.insertOne(doc as any);
  return NextResponse.json({ product: doc }, { status: 201 });
}

