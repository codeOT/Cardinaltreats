import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCollection } from "@/lib/db";
import type { DeliveryAddress } from "@/types";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const col = await getCollection<DeliveryAddress>("addresses");
  const docs = await col
    .find({ userId: (session.user as any).id as string })
    .sort({ isDefault: -1, createdAt: -1 })
    .toArray();

  return NextResponse.json({
    addresses: docs.map((a) => ({ ...a, _id: String((a as any)._id) })),
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.fullName || !body?.line1 || !body?.city || !body?.state || !body?.country || !body?.phone) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const userId = (session.user as any).id as string;
  const col = await getCollection<DeliveryAddress>("addresses");

  const now = new Date().toISOString();

  if (body.isDefault) {
    await col.updateMany({ userId }, { $set: { isDefault: false } });
  }

  const doc: DeliveryAddress = {
    userId,
    fullName: String(body.fullName),
    line1: String(body.line1),
    line2: body.line2 ? String(body.line2) : undefined,
    city: String(body.city),
    state: String(body.state),
    country: String(body.country),
    phone: String(body.phone),
    isDefault: body.isDefault ?? false,
    createdAt: now,
  };

  const res = await col.insertOne(doc as any);
  return NextResponse.json({ address: { ...doc, _id: String(res.insertedId) } }, { status: 201 });
}

