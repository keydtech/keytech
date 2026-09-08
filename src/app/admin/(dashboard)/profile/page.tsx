import { ProfileForm } from "@/components/admin/ProfileForm";
import { requireSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-slate-400">
          Update your display name, username, and password.
        </p>
      </div>
      <ProfileForm name={session.user.name} username={session.user.username} />
    </div>
  );
}
