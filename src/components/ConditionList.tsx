"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Condition {
  id: string;
  name: string;
  notes: string | null;
  createdAt: string | Date;
}

export default function ConditionList({ conditions }: { conditions: Condition[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

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
        <div
          key={condition.id}
          className="flex items-center justify-between bg-white rounded-lg border p-4"
        >
          <div>
            <h4 className="font-medium text-gray-900">{condition.name}</h4>
            {condition.notes && (
              <p className="text-sm text-gray-500 mt-1">{condition.notes}</p>
            )}
          </div>
          <button
            onClick={() => handleDelete(condition.id)}
            disabled={deleting === condition.id}
            className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
          >
            {deleting === condition.id ? "Removing..." : "Remove"}
          </button>
        </div>
      ))}
    </div>
  );
}
