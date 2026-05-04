import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { requireOrdersStaff } from "@/lib/admin";
import type { DeliveryAddress, Order } from "@/types";
import { ADMIN_VISIBLE_ORDER_STATUSES } from "@/lib/orders";

export async function GET() {
  const { ok } = await requireOrdersStaff();
  if (!ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ordersCol = await getCollection<Order>("orders");
  const orders = await ordersCol
    .find({ status: { $in: ADMIN_VISIBLE_ORDER_STATUSES } } as any)
    .sort({ createdAt: -1 })
    .toArray();

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

