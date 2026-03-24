import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { sendOrderConfirmation } from "@/lib/email";
import type { ObjectId } from "mongodb";

interface DBOrder {
  _id?:               ObjectId;
  paystackReference:  string;   // matches the field saved in checkout route
  status:             string;
  couponCode?:        string;
  items:              { productId: number; qty: number }[];
}

export async function GET(req: NextRequest) {
  // Paystack sends ?reference= (not ?ref=) in the callback URL
  const ref =
    req.nextUrl.searchParams.get("reference") ||
    req.nextUrl.searchParams.get("ref");

  if (!ref)
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });

  try {
    const orders   = await getCollection<DBOrder>("orders");
    const products = await getCollection<any>("products");
    const coupons  = await getCollection<any>("coupons");

    const order = await orders.findOne({ paystackReference: ref });
    if (!order)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Already verified — just return current status
    if (order.status !== "pending")
      return NextResponse.json({
        success: true,
        status:  order.status,
        orderId: String(order._id),
      });

    // Verify with Paystack directly
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret)
      return NextResponse.json({ error: "Paystack not configured" }, { status: 500 });

    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`,
      { headers: { Authorization: `Bearer ${paystackSecret}` } }
    );
    const verifyJson = await verifyRes.json().catch(() => null);
    const txnStatus  = verifyJson?.data?.status;

    if (txnStatus === "success") {
      // Mark as processing (not just "paid" — move it forward immediately)
      await orders.updateOne(
        { paystackReference: ref },
        { $set: { status: "processing", paidAt: new Date().toISOString() } }
      );

      // Decrement stock
      for (const item of order.items) {
        await products.updateOne(
          { id: item.productId },
          { $inc: { stock: -item.qty } }
        );
      }

      // Increment coupon usage
      if (order.couponCode) {
        await coupons.updateOne(
          { code: order.couponCode },
          { $inc: { usedCount: 1 } }
        );
      }

      // Send confirmation email
      try {
        const updated = await orders.findOne({ paystackReference: ref });
        if (updated) await sendOrderConfirmation(updated as unknown as import("@/lib/orders").DBOrder);
      } catch (emailErr) {
        console.error("[verify] Email error:", emailErr);
      }

      return NextResponse.json({
        success: true,
        status:  "processing",
        orderId: String(order._id),
      });
    } else {
      // Only cancel if Paystack explicitly says it failed/abandoned
      const failed = ["failed", "abandoned"].includes(txnStatus);
      if (failed) {
        await orders.updateOne(
          { paystackReference: ref },
          { $set: { status: "cancelled" } }
        );
      }
      return NextResponse.json({
        success: false,
        status:  failed ? "cancelled" : txnStatus,
      });
    }
  } catch (err) {
    console.error("[checkout/verify] error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}