import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { hash } from "bcryptjs";
import { getCollection } from "@/lib/db";
import { applyRateLimit } from "@/lib/rate-limit";
import type { ObjectId } from "mongodb";

interface DBUser {
  _id?: ObjectId;
  email: string;
  password?: string;
  provider?: "credentials" | "google";
  resetCodeHash?: string;
  resetCodeExpiresAt?: string;
}

function hashCode(code: string) {
  const secret = process.env.NEXTAUTH_SECRET || "cardinaltreats-reset";
  return crypto.createHmac("sha256", secret).update(code).digest("hex");
}

export async function POST(req: NextRequest) {
  const limited = applyRateLimit(req, "auth-reset-password", 10, 15 * 60 * 1000);
  if (limited) return limited;

  try {
    const { email, code, newPassword } = await req.json();
    const normalized = String(email || "").trim().toLowerCase();
    const resetCode = String(code || "").trim();
    const password = String(newPassword || "");

    if (!normalized || !/^\d{6}$/.test(resetCode) || password.length < 6) {
      return NextResponse.json(
        { error: "Invalid request. Check email, 6-digit code, and password." },
        { status: 400 }
      );
    }

    const users = await getCollection<DBUser>("users");
    const user = await users.findOne({ email: normalized });
    if (!user || user.provider === "google" || !user.password) {
      return NextResponse.json({ error: "Invalid code or email." }, { status: 400 });
    }

    const expectedHash = hashCode(resetCode);
    const isExpired =
      !user.resetCodeExpiresAt || new Date(user.resetCodeExpiresAt).getTime() < Date.now();

    if (!user.resetCodeHash || user.resetCodeHash !== expectedHash || isExpired) {
      return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
    }

    const passwordHash = await hash(password, 12);

    await users.updateOne(
      { _id: user._id as any },
      {
        $set: { password: passwordHash } as any,
        $unset: { resetCodeHash: "", resetCodeExpiresAt: "" } as any,
      }
    );

    return NextResponse.json({ message: "Password reset successful." }, { status: 200 });
  } catch (err) {
    console.error("[auth/reset-password] error:", err);
    return NextResponse.json({ error: "Unable to reset password." }, { status: 500 });
  }
}

