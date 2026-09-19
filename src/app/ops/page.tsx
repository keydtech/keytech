"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/ops/lib/auth";

export default function OpsHomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(isAuthenticated() ? "/ops/dashboard" : "/ops/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0A2540] border-t-transparent" />
    </div>
  );
}
