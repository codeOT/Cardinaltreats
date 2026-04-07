import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db";
import { requireOrdersStaff } from "@/lib/admin";
import { sendStatusUpdate } from "@/lib/email";
import type { DBOrder } from "@/lib/orders";
import type { Order, OrderStatus } from "@/types";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { ok } = await requireOrdersStaff();
  if (!ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const status = body?.status as OrderStatus | undefined;

  if (!status || !["processing", "shipped", "delivered", "cancelled"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const ordersCol = await getCollection<Order>("orders");
  await ordersCol.updateOne(
    { _id: new ObjectId(id) as any },
    { $set: { status, updatedAt: new Date().toISOString() } }
  );

  const order = await ordersCol.findOne({ _id: new ObjectId(id) as any });
  const orderForJson = order
    ? { ...order, _id: String((order as any)?._id) }
    : null;

  if (order?.userEmail) {
    try {
      await sendStatusUpdate({
        ...(order as unknown as DBOrder),
        status,
      });
    } catch (err) {
      console.error("[admin/orders PATCH] status email failed:", err);
    }
  }

  return NextResponse.json({ order: orderForJson });
}

