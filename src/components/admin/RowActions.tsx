"use client";

import { useTransition } from "react";
import { toast } from "sonner";

type Option = { value: string; label: string };

export function StatusSelect({
  id,
  value,
  options,
  action,
}: {
  id: string;
  value: string;
  options: Option[];
  action: (id: string, value: never) => Promise<void>;
}) {
  const [pending, start] = useTransition();
  return (
    <select
      className="admin-form-input admin-form-select"
      style={{ padding: "5px 30px 5px 10px", fontSize: 12, width: "auto" }}
      defaultValue={value}
      disabled={pending}
      aria-label="Status"
      onChange={(e) => {
        const next = e.target.value;
        start(async () => {
          try {
            await action(id, next as never);
            toast.success(`Status set to ${next.toLowerCase()}`);
          } catch {
            toast.error("Could not update status");
          }
        });
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function ToggleButton({
  id,
  active,
  labels,
  action,
}: {
  id: string;
  active: boolean;
  labels: [string, string];
  action: (id: string) => Promise<void>;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className={`admin-chip${active ? " selected" : ""}`}
      disabled={pending}
      aria-pressed={active}
      onClick={() =>
        start(async () => {
          try {
            await action(id);
          } catch {
            toast.error("Update failed");
          }
        })
      }
    >
      {active ? labels[0] : labels[1]}
    </button>
  );
}
