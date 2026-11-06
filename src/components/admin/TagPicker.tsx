"use client";

export function TagPicker({
  tags,
  value,
  onChange,
}: {
  tags: { id: string; name: string }[];
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  if (tags.length === 0) {
    return <span className="admin-form-hint">No tags yet — add them under Settings → Taxonomy.</span>;
  }
  return (
    <div className="admin-chip-list" role="group" aria-label="Tags">
      {tags.map((tag) => {
        const selected = value.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            className={`admin-chip${selected ? " selected" : ""}`}
            aria-pressed={selected}
            onClick={() => onChange(selected ? value.filter((id) => id !== tag.id) : [...value, tag.id])}
          >
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}
