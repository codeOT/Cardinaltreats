import { NextResponse } from "next/server";
import crypto from "crypto";
import type { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { getCollection } from "@/lib/db";
import { requireFullAdmin } from "@/lib/admin";
import { applyRateLimit } from "@/lib/rate-limit";
import type { ObjectId } from "mongodb";

interface DBUser {
  _id?: ObjectId;
  name: string;
  email: string;
  password?: string;
  provider?: "credentials" | "google";
  role?: "customer" | "admin" | "order_manager";
  createdAt: string;
}

export async function POST(req: NextRequest) {
  const limited = applyRateLimit(req, "admin-set-password", 10, 15 * 60 * 1000);
  if (limited) return limited;

  const { ok } = await requireFullAdmin();
  if (!ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  const usersCol = await getCollection<DBUser>("users");
  const user = await usersCol.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const passwordHash = await hash(password, 12);

  await usersCol.updateOne(
    { _id: user._id as any },
    {
      $set: {
        password: passwordHash,
        provider: "credentials",
        // Helps avoid stale reset flows if the user used reset earlier.
        resetCodeHash: (body && (body as any).resetCodeHash) || undefined,
        resetCodeExpiresAt: undefined,
      } as any,
    }
  );

  return NextResponse.json({ ok: true, email, provider: "credentials" });
}

