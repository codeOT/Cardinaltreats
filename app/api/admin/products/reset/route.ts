import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import type { Product } from "@/types";
import { PRODUCTS as SEED_PRODUCTS } from "@/data/products";

export async function POST() {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const productsCol = await getCollection<Product>("products");
  await productsCol.deleteMany({});
  await productsCol.insertMany(
    SEED_PRODUCTS.map((p) => ({
      ...p,
      stockQty: (p as any).stockQty ?? 100,
    })) as any
  );

  return NextResponse.json({ success: true });
}

