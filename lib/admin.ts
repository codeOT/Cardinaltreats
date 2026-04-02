import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  computeStaffAccess,
  type StaffAccessLevel,
} from "@/lib/staff-access";

export type { StaffAccessLevel };

export async function requireStaff(minimum: "orders" | "full") {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? null;
  const role =
    (session?.user as { role?: string } | undefined)?.role ?? null;
  const level = computeStaffAccess({ email, role });
  const ok =
    minimum === "full"
      ? level === "full"
      : level === "full" || level === "orders";
  return { session, level, ok };
}

export async function requireFullAdmin() {
  return requireStaff("full");
}

export async function requireOrdersStaff() {
  return requireStaff("orders");
}

/** @deprecated Use requireFullAdmin or requireOrdersStaff */
export async function requireAdmin() {
  const { session, ok } = await requireFullAdmin();
  return { session, isAdmin: ok };
}
