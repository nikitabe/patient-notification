"use client";

import { useState } from "react";

const inputClass =
  "w-full px-3 py-2 border-2 border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

export default function AdminSettingsForm({
  settings,
}: {
  settings: Record<string, string>;
}) {
  const [fromEmail, setFromEmail] = useState(settings.from_email || "");
  const [adminEmails, setAdminEmails] = useState(settings.admin_emails || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function saveSetting(key: string, value: string) {
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to save.");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await saveSetting("from_email", fromEmail);
      await saveSetting("admin_emails", adminEmails);
      setMessage({ type: "success", text: "Settings saved." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="bg-white rounded-lg border-2 border-gray-200 p-6 space-y-5 max-w-lg">
      <h2 className="font-semibold text-gray-900 text-lg">Email Configuration</h2>

      <div className="space-y-1">
        <label htmlFor="from_email" className="block text-sm font-medium text-gray-900">
          From Email
        </label>
        <input
          id="from_email"
          type="text"
          value={fromEmail}
          onChange={(e) => setFromEmail(e.target.value)}
          placeholder='HealthPulse <notifications@yourdomain.com>'
          className={inputClass}
        />
        <p className="text-xs text-gray-500">
          Format: Name &lt;email@domain.com&gt;. The domain must be verified in your Resend dashboard.
        </p>
      </div>

      <h2 className="font-semibold text-gray-900 text-lg pt-2">Access Control</h2>

      <div className="space-y-1">
        <label htmlFor="admin_emails" className="block text-sm font-medium text-gray-900">
          Admin Emails
        </label>
        <input
          id="admin_emails"
          type="text"
          value={adminEmails}
          onChange={(e) => setAdminEmails(e.target.value)}
          placeholder="admin1@example.com, admin2@example.com"
          className={inputClass}
        />
        <p className="text-xs text-gray-500">
          Comma-separated list of email addresses with admin access.
        </p>
      </div>

      {message && (
        <p
          className={`text-sm rounded-md p-3 font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}
