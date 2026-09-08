"use client";

import { deletePost } from "@/lib/actions/admin";
import { useRouter } from "next/navigation";

export function DeletePostButton({ id }: { id: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      className="text-red-400 hover:underline"
      onClick={() => {
        if (!window.confirm("Delete this post?")) return;
        void deletePost(id).then(() => router.refresh());
      }}
    >
      Delete
    </button>
  );
}
