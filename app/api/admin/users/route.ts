import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { getCollection } from "@/lib/db";
import { requireFullAdmin } from "@/lib/admin";
import { applyRateLimit } from "@/lib/rate-limit";
import type { NextRequest } from "next/server";
import type { ObjectId } from "mongodb";

type StaffRole = "order_manager" | "admin";

interface DBUser {
  _id?: ObjectId;
  name: string;
  email: string;
  password?: string;
  provider?: "credentials" | "google";
  role?: string;
  createdAt: string;
}

export async function POST(req: NextRequest) {
  const limited = applyRateLimit(req, "admin-create-user", 15, 60 * 60 * 1000);
  if (limited) return limited;

  const { ok } = await requireFullAdmin();
  if (!ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  const role = body?.role as StaffRole | undefined;

  if (!name || !email || !password || password.length < 6) {
    return NextResponse.json(
      { error: "Name, email, and password (min 6 characters) are required." },
      { status: 400 }
    );
  }

  if (role !== "order_manager" && role !== "admin") {
    return NextResponse.json(
      { error: "Role must be order_manager or admin." },
      { status: 400 }
    );
  }

  const users = await getCollection<DBUser>("users");
  const existing = await users.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await hash(password, 12);
  await users.insertOne({
    name,
    email,
    password: passwordHash,
    provider: "credentials",
    role,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({
    message: "Staff account created. They can sign in at /admin/login.",
    email,
    role,
  });
}
