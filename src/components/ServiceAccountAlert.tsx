"use client";

import { useEffect, useState } from "react";

export default function ServiceAccountAlert() {
  const [status, setStatus] = useState<{ lowApt: boolean; lowShelbyUsd: boolean; apt: number; shelbyUsd: number } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/service-account-status", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setStatus(data);
      })
      .catch(() => {});
  }, []);

  if (!status || dismissed || (!status.lowApt && !status.lowShelbyUsd)) return null;

  const parts: string[] = [];
  if (status.lowApt) parts.push(`APT is low (${status.apt.toFixed(3)})`);
  if (status.lowShelbyUsd) parts.push(`ShelbyUSD is low (${status.shelbyUsd.toFixed(2)})`);

  return (
    <div className="bg-[var(--danger-soft)] border-b border-[var(--danger)]/30 px-6 sm:px-10 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <p className="text-xs sm:text-sm font-medium text-[var(--danger)]">
          ⚠ Service account {parts.join(" and ")}. Uploads or purchases may fail until it&rsquo;s refunded.
        </p>
        <button onClick={() => setDismissed(true)} className="text-xs text-[var(--danger)] font-semibold shrink-0">
          Dismiss
        </button>
      </div>
    </div>
  );
}
