"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        theme="dark"
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast:
              "border border-white/10 bg-[#0c121e] text-offwhite shadow-xl",
            title: "font-medium",
            description: "text-slate-300",
            success: "!border-teal/40 !bg-[#0c121e]",
            error: "!border-red-500/40 !bg-[#0c121e]",
            closeButton: "border-white/10 bg-[#0c121e] text-slate-300",
          },
        }}
      />
    </SessionProvider>
  );
}
