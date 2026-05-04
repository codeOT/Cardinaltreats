import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { sendDistributorLeadNotification } from "@/lib/email";

interface DistributorLead {
  _id?: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  message?: string;
  createdAt: string;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const name = String(body?.name || "").trim();
  const businessName = String(body?.businessName || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const phone = String(body?.phone || "").trim();
  const city = String(body?.city || "").trim();
  const state = String(body?.state || "").trim();
  const message = String(body?.message || "").trim();

  if (!name || !businessName || !email || !phone || !city || !state) {
    return NextResponse.json(
      { error: "Name, businessName, email, phone, city and state are required." },
      { status: 400 }
    );
  }

  const leads = await getCollection<DistributorLead>("distributor_leads");
  const doc: DistributorLead = {
    name,
    businessName,
    email,
    phone,
    city,
    state,
    message: message || undefined,
    createdAt: new Date().toISOString(),
  };

  const res = await leads.insertOne(doc as any);
  try {
    await sendDistributorLeadNotification({
      name,
      businessName,
      email,
      phone,
      city,
      state,
      message: message || undefined,
    });
  } catch (err) {
    console.error("[distributors POST] failed to send sales notification:", err);
  }

  return NextResponse.json({ ok: true, id: String(res.insertedId) });
}
