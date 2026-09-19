import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "KeydTech Ops",
  description: "Platform administration for tenants and payment claims",
};

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        richColors
        position="top-center"
        closeButton
        toastOptions={{
          className: "font-sans",
        }}
      />
    </>
  );
}
