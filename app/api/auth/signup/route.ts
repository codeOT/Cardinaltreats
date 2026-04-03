import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { hash } from "bcryptjs";
import { getCollection } from "@/lib/db";
import { applyRateLimit } from "@/lib/rate-limit";
import { sendSignupVerificationCodeEmail } from "@/lib/email";
import type { ObjectId } from "mongodb";

interface DBUser {
  _id?:      ObjectId;
  name:      string;
  email:     string;
  password?: string;
  provider?: "credentials" | "google";
  role?:     "customer" | "admin" | "order_manager";
  emailVerified?: boolean;
  emailVerificationCodeHash?: string;
  emailVerificationExpiresAt?: string;
  createdAt: string;
}

function hashCode(code: string) {
  const secret = process.env.NEXTAUTH_SECRET || "cardinaltreats-verify";
  return crypto.createHmac("sha256", secret).update(code).digest("hex");
}

export async function POST(req: NextRequest) {
  const limited = applyRateLimit(req, "auth-signup", 10, 15 * 60 * 1000);
  if (limited) return limited;

  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password)
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });

    if (password.length < 6)
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

    const users    = await getCollection<DBUser>("users");
    const existing = await users.findOne({ email: email.toLowerCase() });

    if (existing)
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const passwordHash = await hash(password, 12);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const emailVerificationCodeHash = hashCode(code);
    const emailVerificationExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await users.insertOne({
      name:      name.trim(),
      email:     email.toLowerCase(),
      password:  passwordHash,
      provider:  "credentials",
      role:      "customer",
      emailVerified: false,
      emailVerificationCodeHash,
      emailVerificationExpiresAt,
      createdAt: new Date().toISOString(),
    });

    await sendSignupVerificationCodeEmail({
      to: email.toLowerCase(),
      code,
      name: name.trim(),
    });

    return NextResponse.json(
      { message: "Account created. Please check your email for a verification code." },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}