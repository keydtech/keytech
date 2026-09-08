import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }
  return session;
}

export async function requireRole(
  allowed: Array<"SUPER_ADMIN" | "EDITOR" | "AUTHOR">,
) {
  const session = await requireSession();
  if (!allowed.includes(session.user.role)) {
    redirect("/admin");
  }
  return session;
}
