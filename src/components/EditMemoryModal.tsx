"use client";

import { useState } from "react";
import { motion } from "motion/react";

interface EditMemoryModalProps {
  memory: { id: string; summary: string; tags: string[] };
  walletAddress?: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditMemoryModal({ memory, walletAddress, onClose, onSaved }: EditMemoryModalProps) {
  const [summary, setSummary] = useState(memory.summary);
  const [tags, setTags] = useState(memory.tags.join(", "));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/memories/${memory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          walletAddress,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="card w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="icon-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <h3 className="font-bold text-lg">Edit memory</h3>
        </div>

        <label className="flex flex-col gap-2 mb-4">
          <span className="field-label">Public summary</span>
          <input
            maxLength={150}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="field"
            autoFocus
          />
        </label>

        <label className="flex flex-col gap-2 mb-5">
          <span className="field-label">Tags</span>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="preferences, project"
            className="field"
          />
        </label>

        {error && <p className="text-xs text-[var(--danger)] mb-3">{error}</p>}

        <p className="text-xs text-[var(--muted)] mb-4">
          Only the summary and tags can be edited. To change the memory&rsquo;s actual content, delete it and store a new one.
        </p>

        <div className="flex gap-2">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
