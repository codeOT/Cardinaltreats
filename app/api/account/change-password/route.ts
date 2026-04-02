import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { compare, hash } from "bcryptjs";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getCollection } from "@/lib/db";
import { applyRateLimit } from "@/lib/rate-limit";
import type { NextRequest } from "next/server";

interface DBUser {
  _id?: ObjectId;
  email: string;
  password?: string;
  provider?: "credentials" | "google";
}

export async function POST(req: NextRequest) {
  const limited = applyRateLimit(req, "account-change-password", 10, 15 * 60 * 1000);
  if (limited) return limited;

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId || !ObjectId.isValid(userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const currentPassword = String(body?.currentPassword || "");
  const newPassword = String(body?.newPassword || "");

  if (!currentPassword || newPassword.length < 6) {
    return NextResponse.json(
      { error: "Current password required. New password must be at least 6 characters." },
      { status: 400 }
    );
  }

  const users = await getCollection<DBUser>("users");
  const user = await users.findOne({ _id: new ObjectId(userId) });
  if (!user?.password) {
    return NextResponse.json(
      { error: "Password change is not available for this account." },
      { status: 400 }
    );
  }

  const valid = await compare(currentPassword, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }

  const passwordHash = await hash(newPassword, 12);
  await users.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { password: passwordHash } }
  );

  return NextResponse.json({ message: "Password updated." });
}
