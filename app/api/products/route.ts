import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import type { Product } from "@/types";

export async function GET() {
  const productsCol = await getCollection<Product>("products");
  const products = await productsCol.find({}).sort({ id: 1 }).toArray();
  return NextResponse.json({ products });
}

