import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db";
import { requireFullAdmin } from "@/lib/admin";
import type { NextRequest } from "next/server";

interface DBUser {
  _id?: ObjectId;
  email?: string;
  role?: string;
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { ok, session } = await requireFullAdmin();
  if (!ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const users = await getCollection<DBUser>("users");
  const target = await users.findOne({ _id: new ObjectId(id) as any });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Prevent admin deleting own account from dashboard.
  const me = session?.user?.email?.toLowerCase();
  if (target.email?.toLowerCase() === me) {
    return NextResponse.json(
      { error: "You cannot delete your own account." },
      { status: 400 }
    );
  }

  await users.deleteOne({ _id: new ObjectId(id) as any });
  return NextResponse.json({ ok: true });
}

