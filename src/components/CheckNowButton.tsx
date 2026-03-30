"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CheckResult {
  status: string;
  message?: string;
  notification?: { id: string };
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
    <div className="space-y-2">
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

      {result && result.status !== "success" && (
        <p
          className={`text-sm rounded-md p-3 ${
            result.status === "no_conditions"
              ? "text-amber-700 bg-amber-50"
              : result.status === "no_advancements"
                ? "text-gray-600 bg-gray-50"
                : "text-red-700 bg-red-50"
          }`}
        >
          {result.message}
        </p>
      )}
    </div>
  );
}
