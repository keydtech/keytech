import { ProfileForm } from "@/components/admin/ProfileForm";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireSession();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, username: true, avatarUrl: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-slate-400">
          Update your photo, display name, username, and password.
        </p>
      </div>
      <ProfileForm
        name={user?.name ?? session.user.name}
        username={user?.username ?? session.user.username}
        avatarUrl={user?.avatarUrl}
      />
    </div>
  );
}
