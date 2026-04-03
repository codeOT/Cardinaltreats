import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getCollection } from "@/lib/db";
import { applyRateLimit } from "@/lib/rate-limit";
import { sendSignupVerificationCodeEmail } from "@/lib/email";
import type { ObjectId } from "mongodb";

interface DBUser {
  _id?: ObjectId;
  name?: string;
  email: string;
  provider?: "credentials" | "google";
  emailVerified?: boolean;
}

function hashCode(code: string) {
  const secret = process.env.NEXTAUTH_SECRET || "cardinaltreats-verify";
  return crypto.createHmac("sha256", secret).update(code).digest("hex");
}

export async function POST(req: NextRequest) {
  const limited = applyRateLimit(req, "auth-resend-verification", 5, 15 * 60 * 1000);
  if (limited) return limited;

  try {
    const body = await req.json().catch(() => null);
    const email = String(body?.email || "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const users = await getCollection<DBUser>("users");
    const user = await users.findOne({ email, provider: "credentials" });
    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }
    if (user.emailVerified) {
      return NextResponse.json({ message: "Email is already verified." }, { status: 200 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const emailVerificationCodeHash = hashCode(code);
    const emailVerificationExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await users.updateOne(
      { _id: user._id as any },
      {
        $set: {
          emailVerificationCodeHash,
          emailVerificationExpiresAt,
        } as any,
      }
    );

    await sendSignupVerificationCodeEmail({
      to: email,
      code,
      name: user.name || null,
    });

    return NextResponse.json({ message: "Verification code sent." }, { status: 200 });
  } catch (err) {
    console.error("[auth/resend-verification] error:", err);
    return NextResponse.json({ error: "Unable to resend verification code." }, { status: 500 });
  }
}

