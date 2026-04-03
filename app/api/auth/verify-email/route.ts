import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getCollection } from "@/lib/db";
import { applyRateLimit } from "@/lib/rate-limit";
import type { ObjectId } from "mongodb";

interface DBUser {
  _id?: ObjectId;
  email: string;
  provider?: "credentials" | "google";
  emailVerified?: boolean;
  emailVerificationCodeHash?: string;
  emailVerificationExpiresAt?: string;
}

function hashCode(code: string) {
  const secret = process.env.NEXTAUTH_SECRET || "cardinaltreats-verify";
  return crypto.createHmac("sha256", secret).update(code).digest("hex");
}

export async function POST(req: NextRequest) {
  const limited = applyRateLimit(req, "auth-verify-email", 10, 15 * 60 * 1000);
  if (limited) return limited;

  try {
    const body = await req.json().catch(() => null);
    const email = String(body?.email || "").trim().toLowerCase();
    const code = String(body?.code || "").trim();

    if (!email || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Invalid email or 6-digit code." }, { status: 400 });
    }

    const users = await getCollection<DBUser>("users");
    const user = await users.findOne({ email, provider: "credentials" });
    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }
    if (user.emailVerified) {
      return NextResponse.json({ message: "Email is already verified." }, { status: 200 });
    }

    const expectedHash = hashCode(code);
    const isExpired =
      !user.emailVerificationExpiresAt ||
      new Date(user.emailVerificationExpiresAt).getTime() < Date.now();

    if (!user.emailVerificationCodeHash || user.emailVerificationCodeHash !== expectedHash || isExpired) {
      return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
    }

    await users.updateOne(
      { _id: user._id as any },
      {
        $set: { emailVerified: true } as any,
        $unset: { emailVerificationCodeHash: "", emailVerificationExpiresAt: "" } as any,
      }
    );

    return NextResponse.json({ message: "Email verified successfully." }, { status: 200 });
  } catch (err) {
    console.error("[auth/verify-email] error:", err);
    return NextResponse.json({ error: "Unable to verify email." }, { status: 500 });
  }
}

