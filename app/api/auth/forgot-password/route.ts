import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getCollection } from "@/lib/db";
import { sendPasswordResetCodeEmail } from "@/lib/email";
import type { ObjectId } from "mongodb";

interface DBUser {
  _id?: ObjectId;
  name: string;
  email: string;
  password?: string;
  provider?: "credentials" | "google";
  resetCodeHash?: string;
  resetCodeExpiresAt?: string;
}

const GENERIC_RESPONSE = {
  message: "If an account exists for this email, a reset code has been sent.",
};

function hashCode(code: string) {
  const secret = process.env.NEXTAUTH_SECRET || "cardinaltreats-reset";
  return crypto.createHmac("sha256", secret).update(code).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const normalized = String(email || "").trim().toLowerCase();
    if (!normalized) {
      return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
    }

    const users = await getCollection<DBUser>("users");
    const user = await users.findOne({ email: normalized });

    // Always return generic response to avoid account enumeration.
    if (!user || user.provider === "google" || !user.password) {
      return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeHash = hashCode(code);
    const resetCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await users.updateOne(
      { _id: user._id as any },
      {
        $set: {
          resetCodeHash,
          resetCodeExpiresAt,
        } as any,
      }
    );

    await sendPasswordResetCodeEmail({
      to: normalized,
      code,
      name: user.name,
    });

    return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
  } catch (err) {
    console.error("[auth/forgot-password] error:", err);
    return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
  }
}

