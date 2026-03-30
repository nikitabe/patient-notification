"use client";

import { useState } from "react";

export default function AdminSettingsForm({
  settings,
}: {
  settings: Record<string, string>;
}) {
  const [fromEmail, setFromEmail] = useState(settings.from_email || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "from_email", value: fromEmail }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Settings saved." });
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to save." });
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="bg-white rounded-lg border p-6 space-y-4 max-w-lg">
      <h2 className="font-semibold text-gray-900">Email Configuration</h2>

      <div className="space-y-1">
        <label htmlFor="from_email" className="block text-sm font-medium text-gray-700">
          From Email
        </label>
        <input
          id="from_email"
          type="text"
          value={fromEmail}
          onChange={(e) => setFromEmail(e.target.value)}
          placeholder='HealthPulse <notifications@yourdomain.com>'
          className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400">
          Format: Name &lt;email@domain.com&gt;. The domain must be verified in your Resend dashboard.
        </p>
      </div>

      {message && (
        <p
          className={`text-sm rounded-md p-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}
