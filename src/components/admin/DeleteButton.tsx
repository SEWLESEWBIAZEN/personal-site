"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteButtonProps {
  id: string;
  action: (id: string) => Promise<unknown>;
  label: string;
  redirectTo?: string;
}

export function DeleteButton({ id, action, label, redirectTo }: DeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  const handleDelete = () =>
    start(async () => {
      try {
        const result = (await action(id)) as { ok?: boolean; error?: string } | undefined;
        if (result && result.ok === false) {
          toast.error(result.error ?? `Could not delete ${label}`);
          setConfirming(false);
          return;
        }
        toast.success(`Deleted ${label}`);
        if (redirectTo) router.push(redirectTo);
        router.refresh();
      } catch {
        toast.error(`Could not delete ${label}`);
      }
    });

  if (confirming) {
    return (
      <span className="admin-btn-row">
        <button type="button" onClick={handleDelete} disabled={pending} className="admin-btn admin-btn-sm admin-btn-danger">
          {pending ? "Deleting…" : "Confirm delete"}
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="admin-btn admin-btn-sm">
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button type="button" onClick={() => setConfirming(true)} className="admin-btn admin-btn-sm admin-btn-danger" aria-label={`Delete ${label}`}>
      <Trash2 size={12} />
    </button>
  );
}
