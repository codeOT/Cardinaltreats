import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserOrders } from "@/lib/orders";
import { getCollection } from "@/lib/db";
import type { DeliveryAddress } from "@/types";

export async function GET() {
  const session = await getServerSession(authOptions);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (session?.user as any)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const orders = await getUserOrders(userId);

    // Hydrate missing deliveryAddress from user's saved addresses (helps older orders).
    const needsHydration = orders.some((o) => !o.deliveryAddress);
    if (needsHydration) {
      const addressesCol = await getCollection<DeliveryAddress>("addresses");
      const list = await addressesCol
        .find({ userId })
        .sort({ isDefault: -1, createdAt: -1 } as any)
        .toArray();
      const best = list[0] ? ({ ...list[0], _id: String((list[0] as any)._id) } as any) : null;
      const hydrated = orders.map((o) => (o.deliveryAddress ? o : { ...o, deliveryAddress: best || undefined }));
      return NextResponse.json({ orders: hydrated });
    }

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("[orders/me] error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
