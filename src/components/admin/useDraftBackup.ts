"use client";

import { useEffect, useRef, useState } from "react";

type Backup<T> = { savedAt: number; values: T };

// Keeps a local copy of unsaved form values so a crash or closed tab never loses writing.
export function useDraftBackup<T>(key: string, values: T, serverUpdatedAt: number, dirty: boolean) {
  const [restorable, setRestorable] = useState<Backup<T> | null>(null);
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const backup = JSON.parse(raw) as Backup<T>;
      if (backup.savedAt > serverUpdatedAt) setRestorable(backup);
      else localStorage.removeItem(key);
    } catch {}
  }, [key, serverUpdatedAt]);

  useEffect(() => {
    if (!dirty) return;
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), values }));
      } catch {}
    }, 800);
    return () => window.clearTimeout(t);
  }, [key, values, dirty]);

  const clear = () => {
    setRestorable(null);
    try {
      localStorage.removeItem(key);
    } catch {}
  };

  return { restorable, clear, dismiss: () => setRestorable(null) };
}
