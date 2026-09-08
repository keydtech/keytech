import { AdminProviders } from "@/components/admin/AdminProviders";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | KeydTech",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminProviders>{children}</AdminProviders>;
}
