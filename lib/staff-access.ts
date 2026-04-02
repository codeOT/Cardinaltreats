export type StaffAccessLevel = "full" | "orders" | null;

export function parseEmailAllowlist(val: string | undefined): string[] {
  if (!val) return [];
  return val
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Full admin: role admin or email in ADMIN_EMAILS.
 * Order staff: role order_manager or email in ORDER_MANAGER_EMAILS.
 */
export function computeStaffAccess(params: {
  email?: string | null;
  role?: string | null;
}): StaffAccessLevel {
  const email = params.email?.toLowerCase() ?? "";
  const role = params.role ?? "";
  const adminEmails = parseEmailAllowlist(process.env.ADMIN_EMAILS);
  const orderManagerEmails = parseEmailAllowlist(process.env.ORDER_MANAGER_EMAILS);

  if (role === "admin" || (email && adminEmails.includes(email))) return "full";
  if (role === "order_manager" || (email && orderManagerEmails.includes(email))) {
    return "orders";
  }
  return null;
}
