"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImportanceBadge from "./ImportanceBadge";

interface Advancement {
  id: string;
  title: string;
  summary: string;
  importance: string;
  explanation: string;
  condition: { name: string };
}

interface CheckResult {
  status: string;
  message?: string;
  notification?: {
    id: string;
    subject: string;
    sentAt: string;
    advancements: Advancement[];
  };
}

export default function CheckNowButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const router = useRouter();

  async function handleCheck() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/check-now", { method: "POST" });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setResult({
          status: "error",
          message: `Server returned ${res.status}: ${text.slice(0, 200)}`,
        });
        return;
      }
      setResult(data);
      if (data.status === "success") router.refresh();
    } catch (err) {
      setResult({
        status: "error",
        message: err instanceof Error ? err.message : "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleCheck}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Checking for advancements...
          </>
        ) : (
          "Check Now"
        )}
      </button>

      {result && (
        <div className="rounded-lg border p-4">
          {result.status === "no_conditions" && (
            <p className="text-amber-700 bg-amber-50 rounded-md p-3 text-sm">
              {result.message}
            </p>
          )}

          {result.status === "no_advancements" && (
            <p className="text-gray-600 bg-gray-50 rounded-md p-3 text-sm">
              {result.message}
            </p>
          )}

          {result.status === "error" && (
            <p className="text-red-700 bg-red-50 rounded-md p-3 text-sm">
              {result.message}
            </p>
          )}

          {result.status === "success" && result.notification && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">
                {result.notification.advancements.length} advancement
                {result.notification.advancements.length !== 1 ? "s" : ""} found
              </h3>
              {result.notification.advancements.map((adv) => (
                <div key={adv.id} className="bg-white rounded-lg border p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{adv.title}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Condition: {adv.condition.name}
                      </p>
                    </div>
                    <ImportanceBadge importance={adv.importance} />
                  </div>
                  <p className="text-sm text-gray-700">{adv.summary}</p>
                  <div className="bg-blue-50 rounded-md p-3">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Why this matters: </span>
                      {adv.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
