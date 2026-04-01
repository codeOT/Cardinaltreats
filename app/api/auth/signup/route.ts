import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { getCollection } from "@/lib/db";
import { applyRateLimit } from "@/lib/rate-limit";
import type { ObjectId } from "mongodb";

interface DBUser {
  _id?:      ObjectId;
  name:      string;
  email:     string;
  password?: string;
  provider?: "credentials" | "google";
  role?:     "customer" | "admin";
  createdAt: string;
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

    await users.insertOne({
      name:      name.trim(),
      email:     email.toLowerCase(),
      password:  passwordHash,
      provider:  "credentials",
      role:      "customer",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Account created successfully" }, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}