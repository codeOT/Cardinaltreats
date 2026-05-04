import { NextResponse } from "next/server";
import crypto from "crypto";
import { deleteUnpaidOrderByReference, findOrderByReference, type DBOrder } from "@/lib/orders";
import { getCollection } from "@/lib/db";
import { sendOrderConfirmation } from "@/lib/email";

interface DBUser {
  _id?: string;
  email: string;
}

export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  const incomingSignature = req.headers.get("x-paystack-signature");
  if (!incomingSignature || incomingSignature !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const eventName = String(event.event || "");

  if (eventName === "charge.failed") {
    const ref = event.data?.reference as string | undefined;
    if (ref) await deleteUnpaidOrderByReference(ref);
    return NextResponse.json({ received: true });
  }

  if (eventName !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const reference = event.data?.reference as string | undefined;
  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  const order = await findOrderByReference(reference);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const ordersCol = await getCollection<DBOrder>("orders");
  const paidAt = new Date().toISOString();
  await ordersCol.updateOne(
    { _id: order._id } as any,
    {
      $set: {
        status: "processing",
        updatedAt: paidAt,
        paidAt: (order as any).paidAt || paidAt,
      },
    } as any
  );

  const users = await getCollection<DBUser>("users");
  const user = await users.findOne({ _id: order.userId as any }).catch(() => null);
  const toEmail = user?.email || (order as any).userEmail || null;

  if (toEmail) {
    // Ensure email is sent to the order's email (works for guest checkout).
    const orderForEmail = { ...order, userEmail: toEmail, status: "processing" as const };
    await sendOrderConfirmation(orderForEmail as any);
  }

  return NextResponse.json({ received: true });
}

