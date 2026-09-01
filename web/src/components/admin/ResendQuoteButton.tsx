"use client";

import { useState, useTransition } from "react";
import { resendQuoteEmail } from "@/app/actions/quotes";

export default function ResendQuoteButton({ quoteId }: { quoteId: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");

  return (
    <div className="admin-inline-row">
      <button
        type="button"
        className="btn"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await resendQuoteEmail(quoteId);
            setMsg(r.message);
          })
        }
      >
        {pending ? "Resending…" : "Resend quote email"}
      </button>
      {msg && <span className="admin-muted">{msg}</span>}
    </div>
  );
}
