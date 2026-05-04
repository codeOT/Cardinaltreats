import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import type { DBOrder } from "@/lib/orders";
import { findOrderByReference } from "@/lib/orders";
import { sendOrderConfirmation } from "@/lib/email";
import { applyRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limited = applyRateLimit(req, "orders-confirm", 30, 15 * 60 * 1000);
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const reference = String(body?.reference || "").trim();
  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "PAYSTACK_SECRET_KEY not configured" }, { status: 500 });
  }

  const order = await findOrderByReference(reference);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Verify transaction status with Paystack (prevents spoofing)
  const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
  });
  const verifyJson = await verifyRes.json().catch(() => null);
  const success = Boolean(verifyRes.ok && verifyJson?.status && verifyJson?.data?.status === "success");
  if (!success) {
    return NextResponse.json({ error: "Payment not verified" }, { status: 400 });
  }

  const ordersCol = await getCollection<DBOrder>("orders");
  const existing = await ordersCol.findOne({ paystackReference: reference } as any);
  const now = new Date().toISOString();
  await ordersCol.updateOne(
    { paystackReference: reference } as any,
    {
      $set: {
        status: "processing",
        updatedAt: now,
        paidAt: (existing as any)?.paidAt || now,
      },
    } as any
  );

  const alreadySent = Boolean((existing as any)?.emailSentAt);

  if (alreadySent) {
    return NextResponse.json({ ok: true, emailSent: false, alreadySent: true });
  }

  const to = (order as any).userEmail as string | null | undefined;
  if (!to) {
    return NextResponse.json(
      { error: "No email found for this order. Please contact support." },
      { status: 400 }
    );
  }

  try {
    const info = await sendOrderConfirmation({ ...order, status: "processing" } as any);
    await ordersCol.updateOne(
      { paystackReference: reference } as any,
      {
        $set: {
          emailSentAt: new Date().toISOString(),
          emailTo: to,
          emailMessageId: info?.messageId,
          emailAccepted: info?.accepted,
          emailRejected: info?.rejected,
        },
      } as any
    );
    return NextResponse.json({
      ok: true,
      emailSent: true,
      alreadySent: false,
      mail: { to, ...info },
    });
  } catch (err: any) {
    const message = typeof err?.message === "string" ? err.message : "Failed to send email";
    await ordersCol.updateOne(
      { paystackReference: reference } as any,
      { $set: { emailLastError: message, emailLastErrorAt: new Date().toISOString() } } as any
    );
    return NextResponse.json({ error: `Email send failed: ${message}` }, { status: 500 });
  }
}

