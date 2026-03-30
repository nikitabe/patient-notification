"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const inputClass =
  "w-full px-3 py-2 border-2 border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

interface Condition {
  id: string;
  name: string;
  notes: string | null;
  createdAt: string | Date;
}

export default function ConditionList({ conditions }: { conditions: Condition[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  function startEdit(condition: Condition) {
    setEditingId(condition.id);
    setEditName(condition.name);
    setEditNotes(condition.notes || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditNotes("");
  }

  async function handleSave(id: string) {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/conditions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), notes: editNotes.trim() || null }),
      });
      if (res.ok) {
        setEditingId(null);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/conditions/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  if (conditions.length === 0) {
    return (
      <p className="text-gray-500 text-sm">
        No conditions added yet. Add one above to start receiving advancement notifications.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {conditions.map((condition) => (
        <div key={condition.id} className="bg-white rounded-lg border p-4">
          {editingId === condition.id ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className={inputClass}
                autoFocus
              />
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Optional notes (medications, treatment stage, etc.)"
                rows={2}
                className={inputClass}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleSave(condition.id)}
                  disabled={saving || !editName.trim()}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-3 py-1.5 border-2 border-gray-300 text-sm text-gray-700 rounded-md hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{condition.name}</h4>
                {condition.notes && (
                  <p className="text-sm text-gray-500 mt-1">{condition.notes}</p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => startEdit(condition)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(condition.id)}
                  disabled={deleting === condition.id}
                  className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  {deleting === condition.id ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
