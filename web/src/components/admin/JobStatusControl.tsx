"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateJobStatus } from "@/app/actions/jobs";
import type { JobStatus } from "@/lib/types";

export default function JobStatusControl({
  jobId,
  current,
  allowed,
}: {
  jobId: string;
  current: JobStatus;
  allowed: JobStatus[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [next, setNext] = useState<JobStatus | "">("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (allowed.length === 0) {
    return (
      <p className="admin-muted">
        This job is {current} — no further status changes.
      </p>
    );
  }

  return (
    <div className="admin-manage-block">
      {msg && (
        <div className={`admin-inline-msg ${msg.ok ? "ok" : "err"}`} role="status">
          {msg.text}
        </div>
      )}
      <div className="admin-inline-row">
        <select
          value={next}
          onChange={(e) => setNext(e.target.value as JobStatus)}
        >
          <option value="">{current} (current)</option>
          {allowed.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn-primary"
          disabled={pending || !next}
          onClick={() =>
            start(async () => {
              const r = await updateJobStatus(jobId, next as JobStatus);
              setMsg({ ok: r.ok, text: r.message });
              if (r.ok) {
                setNext("");
                router.refresh();
              }
            })
          }
        >
          Update
        </button>
      </div>
    </div>
  );
}
