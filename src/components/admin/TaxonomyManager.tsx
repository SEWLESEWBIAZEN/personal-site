"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createCategory, createTag, deleteCategory, deleteTag } from "@/server/actions/settings";
import { DeleteButton } from "./DeleteButton";

type Row = { id: string; name: string; count: number };

function Column({
  title,
  rows,
  onCreate,
  onDelete,
  pending,
}: {
  title: string;
  rows: Row[];
  onCreate: (name: string) => void;
  onDelete: (id: string) => Promise<void>;
  pending: boolean;
}) {
  const [name, setName] = useState("");
  return (
    <div>
      <h3 className="admin-form-label">{title.toUpperCase()}</h3>
      <form
        style={{ display: "flex", gap: 6, marginBottom: 12 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          onCreate(name.trim());
          setName("");
        }}
      >
        <input className="admin-form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder={`New ${title.toLowerCase().replace(/s$/, "")}`} maxLength={80} aria-label={`New ${title}`} />
        <button type="submit" className="admin-btn admin-btn-sm" disabled={pending || !name.trim()} aria-label={`Add ${title}`}>
          <Plus size={12} />
        </button>
      </form>
      <div className="admin-list">
        {rows.map((r) => (
          <div className="admin-list-row" key={r.id}>
            <span>
              {r.name} <span className="admin-list-meta">· {r.count} item{r.count === 1 ? "" : "s"}</span>
            </span>
            <DeleteButton id={r.id} action={onDelete} label={title.toLowerCase().replace(/s$/, "")} />
          </div>
        ))}
        {rows.length === 0 && <p className="admin-list-meta">None yet.</p>}
      </div>
    </div>
  );
}

export function TaxonomyManager({ categories, tags }: { categories: Row[]; tags: Row[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const create = (fn: () => Promise<void>) =>
    start(async () => {
      try {
        await fn();
        toast.success("Added");
        router.refresh();
      } catch {
        toast.error("Could not add");
      }
    });

  return (
    <section className="admin-card">
      <h2 className="admin-section-title">Taxonomy</h2>
      <p className="admin-form-hint" style={{ marginTop: -8, marginBottom: 20 }}>
        Deleting a category or tag keeps the content; it is simply unassigned.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 32 }}>
        <Column title="Categories" rows={categories} pending={pending} onCreate={(name) => create(() => createCategory({ name }))} onDelete={deleteCategory} />
        <Column title="Tags" rows={tags} pending={pending} onCreate={(name) => create(() => createTag({ name }))} onDelete={deleteTag} />
      </div>
    </section>
  );
}
