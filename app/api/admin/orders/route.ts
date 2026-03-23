import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import type { DeliveryAddress, Order } from "@/types";

export async function GET() {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ordersCol = await getCollection<Order>("orders");
  const orders = await ordersCol.find({}).sort({ createdAt: -1 }).toArray();

  // Hydrate missing deliveryAddress from addresses collection (for older orders).
  const addressesCol = await getCollection<DeliveryAddress>("addresses");

  const withId = await Promise.all(
    orders.map(async (o) => {
      let deliveryAddress = (o as any).deliveryAddress as DeliveryAddress | undefined;
      if (!deliveryAddress && (o as any).userId) {
        const best = await addressesCol
          .find({ userId: (o as any).userId })
          .sort({ isDefault: -1, createdAt: -1 } as any)
          .limit(1)
          .toArray();
        deliveryAddress = best[0] ? ({ ...best[0], _id: String((best[0] as any)._id) } as any) : undefined;
      }

      return {
        ...o,
        deliveryAddress,
        _id: String((o as any)._id),
      };
    })
  );

  return NextResponse.json({ orders: withId });
}

