"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConditionForm() {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/conditions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), notes: notes.trim() || null }),
      });

      if (res.ok) {
        setName("");
        setNotes("");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-4 space-y-3">
      <h3 className="font-semibold text-gray-900">Add a Health Condition</h3>
      <input
        type="text"
        placeholder="Condition name (e.g., Type 2 Diabetes)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-3 py-2 border-2 border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required
      />
      <textarea
        placeholder="Optional notes (medications, treatment stage, etc.)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 border-2 border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {loading ? "Adding..." : "Add Condition"}
      </button>
    </form>
  );
}
