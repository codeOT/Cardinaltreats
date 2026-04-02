"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin) return;
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace(
        `/admin/login?callbackUrl=${encodeURIComponent(pathname || "/admin")}`
      );
      return;
    }
    const access = session?.user?.staffAccess;
    if (!access) {
      router.replace("/");
    }
  }, [isLogin, status, session, router, pathname]);

  if (isLogin) {
    return <>{children}</>;
  }

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center text-stone-500 text-sm">
        Loading…
      </div>
    );
  }

  if (!session?.user?.staffAccess) {
    return (
      <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center text-stone-500 text-sm">
        Access denied…
      </div>
    );
  }

  return <>{children}</>;
}
