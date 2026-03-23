import { NextResponse } from "next/server";
import crypto from "crypto";
import { findOrderByReference, updateOrderStatus } from "@/lib/orders";
import { getCollection } from "@/lib/db";
import type { User } from "@/types";
import { sendOrderConfirmation } from "@/lib/email";

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
  if (event.event !== "charge.success") {
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

  await updateOrderStatus(String(order._id), "processing");

  const users = await getCollection<User>("users");
  const user = await users.findOne({ _id: order.userId as any }).catch(() => null);
  const toEmail = user?.email || (order as any).userEmail || null;

  if (toEmail) {
    // Ensure email is sent to the order's email (works for guest checkout).
    const orderForEmail = { ...order, userEmail: toEmail, status: "processing" as const };
    await sendOrderConfirmation(orderForEmail as any);
  }

  return NextResponse.json({ received: true });
}

