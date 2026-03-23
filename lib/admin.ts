import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function parseAdminEmails(val: string | undefined): string[] {
  if (!val) return [];
  return val
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  const role = (session?.user as any)?.role as string | undefined;
  const adminEmails = parseAdminEmails(process.env.ADMIN_EMAILS);

  const isAdmin =
    role === "admin" || (!!email && adminEmails.includes(email));

  return { session, isAdmin };
}

