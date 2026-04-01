import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createOrder } from "@/lib/orders";
import { getCollection } from "@/lib/db";
import { applyRateLimit } from "@/lib/rate-limit";
import type { Coupon, DeliveryAddress, OrderItem, Product } from "@/types";

export async function POST(req: NextRequest) {
  const limited = applyRateLimit(req, "orders-checkout", 20, 15 * 60 * 1000);
  if (limited) return limited;

  const session = await getServerSession(authOptions);
  const body = await req.json().catch(() => null);
  const items = (body?.items || []) as OrderItem[];
  const couponCodeRaw = body?.couponCode as string | undefined;
  const guestEmail = (body?.guestEmail as string | undefined)?.trim();
  const deliveryAddress = (body?.deliveryAddress || undefined) as Partial<DeliveryAddress> | undefined;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((!session || !(session.user as any).id) && !guestEmail) {
    return NextResponse.json(
      { error: "Email is required for guest checkout" },
      { status: 400 }
    );
  }

  // Delivery address is required for fulfilment (both signed-in & guest).
  if (
    !deliveryAddress ||
    !deliveryAddress.fullName ||
    !deliveryAddress.line1 ||
    !deliveryAddress.city ||
    !deliveryAddress.state ||
    !deliveryAddress.country ||
    !deliveryAddress.phone
  ) {
    return NextResponse.json({ error: "Delivery address is required" }, { status: 400 });
  }

  // Validate stock per grams using DB as source of truth
  const productsCol = await getCollection<Product>("products");
  const ids = Array.from(new Set(items.map((i) => Number(i.productId)).filter(Number.isFinite)));
  const dbProducts = await productsCol
    .find({ id: { $in: ids } as any })
    .project({ id: 1, name: 1, stockQty: 1, stockQty50: 1, stockQty100: 1 } as any)
    .toArray();
  const map = new Map<number, any>(dbProducts.map((p: any) => [Number(p.id), p]));

  for (const it of items) {
    const pid = Number(it.productId);
    const grams = Number((it as any).grams ?? 100);
    const qty = Number(it.qty ?? 0);
    const p = map.get(pid);
    if (!p) {
      return NextResponse.json({ error: `Product not found: ${it.name || pid}` }, { status: 400 });
    }
    const available =
      grams === 50
        ? Number(p.stockQty50 ?? p.stockQty ?? 0)
        : Number(p.stockQty100 ?? p.stockQty ?? 0);
    if (!Number.isFinite(qty) || qty <= 0) {
      return NextResponse.json({ error: "Invalid quantity in cart" }, { status: 400 });
    }
    if (!Number.isFinite(available) || available <= 0) {
      return NextResponse.json({ error: `${p.name} (${grams}g) is sold out.` }, { status: 400 });
    }
    if (available < qty) {
      return NextResponse.json(
        { error: `${p.name} (${grams}g) has only ${available} left.` },
        { status: 400 }
      );
    }
  }

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0),
    0
  );

  let discountPercent = 0;
  let couponCode: string | undefined;

  if (couponCodeRaw) {
    const coupons = await getCollection<Coupon>("coupons");
    const now  = new Date();
    const code = couponCodeRaw.trim().toUpperCase();
    const coupon = await coupons.findOne({ code, active: true });
    if (
      coupon &&
      (!coupon.validFrom || new Date(coupon.validFrom) <= now) &&
      (!coupon.validTo   || new Date(coupon.validTo)   >= now) &&
      (!coupon.maxUses   || coupon.usedCount < coupon.maxUses)
    ) {
      discountPercent = coupon.discountPercent;
      couponCode      = coupon.code;
    }
  }

  const discount  = Math.round((subtotal * discountPercent) / 100);
  const total     = subtotal - discount;
  const reference = `CardinalTreats_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

 
  const userId    = (session && (session.user as any).id) ||
    (guestEmail ? `guest:${guestEmail.toLowerCase()}` : "guest");
  const userEmail = session?.user?.email || guestEmail || null;
 
  const userName  = (session && (session.user as any).name) || null;

  const order = await createOrder({
    userId,
    userEmail,
    userName,
    items,
    subtotal,
    discount,
    total,
    paystackReference: reference,
    couponCode,
    discountPercent,
    deliveryAddress: deliveryAddress as DeliveryAddress,
  });

  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecret) {
    return NextResponse.json(
      { error: "PAYSTACK_SECRET_KEY not configured" },
      { status: 500 }
    );
  }

  const initRes = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization:  `Bearer ${paystackSecret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email:    userEmail,
      amount:   total * 100, // kobo
      reference,
      metadata: { orderId: order._id },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || ""}${
        session && (session.user as any)?.id ? `/account?reference=${reference}` : "/checkout/success"
      }`,
    }),
  });

  const initJson = await initRes.json().catch(() => null);
  if (!initRes.ok || !initJson?.data?.authorization_url) {
    return NextResponse.json(
      { error: "Failed to initialize Paystack payment" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    orderId:          order._id,
    reference,
    authorizationUrl: initJson.data.authorization_url,
  });
}