"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { convertQuoteToJob } from "@/app/actions/jobs";

export default function ConvertToJobButton({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState("");

  return (
    <div>
      {err && (
        <div className="admin-inline-msg err" role="status">
          {err}
        </div>
      )}
      <button
        type="button"
        className="btn btn-primary"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await convertQuoteToJob(quoteId);
            if (r.ok && r.jobId) {
              router.push(`/admin/jobs/${r.jobId}`);
            } else {
              setErr(r.message);
            }
          })
        }
      >
        {pending ? "Converting…" : "Convert to job"}
      </button>
    </div>
  );
}
