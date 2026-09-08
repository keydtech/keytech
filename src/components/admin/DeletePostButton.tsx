"use client";

import { deletePost } from "@/lib/actions/admin";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function DeletePostButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      className="rounded-lg border border-red-500/30 px-2.5 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
      onClick={() => {
        if (!window.confirm("Delete this post? This cannot be undone.")) return;
        setBusy(true);
        void deletePost(id)
          .then((result) => {
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success("Post deleted");
            router.refresh();
          })
          .catch((err) => {
            toast.error(err instanceof Error ? err.message : "Delete failed");
          })
          .finally(() => setBusy(false));
      }}
    >
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}
