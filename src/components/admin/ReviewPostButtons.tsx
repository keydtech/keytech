"use client";

import { approvePost, rejectPost } from "@/lib/actions/admin";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function ReviewPostButtons({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);

  if (status !== "PENDING_REVIEW" && status !== "DRAFT") return null;

  async function run(action: "approve" | "reject") {
    setBusy(action);
    try {
      const result =
        action === "approve" ? await approvePost(id) : await rejectPost(id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(action === "approve" ? "Post published" : "Sent back to draft");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      {status === "PENDING_REVIEW" || status === "DRAFT" ? (
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void run("approve")}
          className="rounded-lg border border-teal/40 px-2.5 py-1 text-xs font-semibold text-teal hover:bg-teal/10 disabled:opacity-50"
        >
          {busy === "approve" ? "…" : "Approve"}
        </button>
      ) : null}
      {status === "PENDING_REVIEW" ? (
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void run("reject")}
          className="rounded-lg border border-amber-500/30 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/10 disabled:opacity-50"
        >
          {busy === "reject" ? "…" : "Reject"}
        </button>
      ) : null}
    </>
  );
}
