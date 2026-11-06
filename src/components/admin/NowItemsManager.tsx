"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { createNowItem, deleteNowItem, updateNowItem } from "@/server/actions/settings";
import type { NowItemInput } from "@/schemas/settings";
import { DeleteButton } from "./DeleteButton";

interface NowItem {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  displayOrder: number;
  isActive: boolean;
}

const categoryOptions = ["ai", "architecture", "product", "learning", "exploration"];

function NowRow({ item, onSave, pending }: { item: NowItemInput & { id?: string }; onSave: (v: NowItemInput) => void; pending: boolean }) {
  const [initial] = useState<NowItemInput>(() => ({
    title: item.title,
    description: item.description ?? "",
    category: item.category ?? "exploration",
    displayOrder: item.displayOrder,
    isActive: item.isActive,
  }));
  const [v, setV] = useState<NowItemInput>(initial);
  const dirty = !item.id || JSON.stringify(v) !== JSON.stringify(initial);

  return (
    <div className="now-row">
      <input className="admin-form-input" aria-label="Title" placeholder="Title" value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
      <input className="admin-form-input" aria-label="Description" placeholder="Short description" value={v.description ?? ""} onChange={(e) => setV({ ...v, description: e.target.value })} />
      <select className="admin-form-input admin-form-select" aria-label="Icon" value={v.category ?? ""} onChange={(e) => setV({ ...v, category: e.target.value })}>
        {categoryOptions.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <input className="admin-form-input" aria-label="Order" type="number" min={0} value={v.displayOrder} onChange={(e) => setV({ ...v, displayOrder: Number(e.target.value) || 0 })} style={{ width: 70 }} />
      <label className="admin-check">
        <input type="checkbox" checked={v.isActive} onChange={(e) => setV({ ...v, isActive: e.target.checked })} /> Active
      </label>
      <button type="button" className="admin-btn admin-btn-sm" disabled={pending || !dirty || !v.title.trim()} onClick={() => onSave(v)} aria-label="Save item">
        <Save size={12} />
      </button>
    </div>
  );
}

export function NowItemsManager({ items }: { items: NowItem[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [adding, setAdding] = useState(false);

  const save = (id: string | undefined, v: NowItemInput) =>
    start(async () => {
      try {
        if (id) await updateNowItem(id, v);
        else {
          await createNowItem(v);
          setAdding(false);
        }
        toast.success("Saved");
        router.refresh();
      } catch {
        toast.error("Could not save item");
      }
    });

  return (
    <section className="admin-card">
      <div className="admin-header" style={{ marginBottom: 12 }}>
        <div>
          <h2 className="admin-section-title" style={{ margin: 0 }}>Now / currently exploring</h2>
          <p className="admin-subtitle">SHOWN ON THE HOMEPAGE AND /NOW</p>
        </div>
        <button type="button" className="admin-btn admin-btn-sm" onClick={() => setAdding(true)} disabled={adding}>
          <Plus size={12} /> Add item
        </button>
      </div>
      <div className="admin-list">
        {items.map((item) => (
          <div key={item.id} className="admin-list-row" style={{ alignItems: "flex-start" }}>
            <NowRow item={item} pending={pending} onSave={(v) => save(item.id, v)} />
            <DeleteButton id={item.id} action={deleteNowItem} label="item" />
          </div>
        ))}
        {adding && (
          <div className="admin-list-row">
            <NowRow item={{ title: "", description: "", category: "exploration", displayOrder: items.length + 1, isActive: true }} pending={pending} onSave={(v) => save(undefined, v)} />
          </div>
        )}
        {items.length === 0 && !adding && <p className="admin-list-meta">No items yet.</p>}
      </div>
    </section>
  );
}
