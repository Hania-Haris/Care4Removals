"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { respondToQuote, type CustomerResponse } from "@/app/actions/customer";
import type { QuoteStatus } from "@/lib/types";

export default function CustomerResponsePanel({
  token,
  respondable,
  currentStatus,
  termsText,
}: {
  token: string;
  respondable: boolean;
  currentStatus: QuoteStatus;
  termsText: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [mode, setMode] = useState<CustomerResponse | null>(null);
  const [ack, setAck] = useState(false);
  const [changeMsg, setChangeMsg] = useState("");
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(
    null
  );

  if (!respondable) {
    if (["accepted", "declined", "changes-requested"].includes(currentStatus)) {
      return null; // banner on the page already explains the state
    }
    return (
      <p className="cq-muted">
        This quotation can&apos;t be responded to online right now. Please
        contact us directly.
      </p>
    );
  }

  function submit(response: CustomerResponse) {
    setResult(null);
    start(async () => {
      const res = await respondToQuote(
        token,
        response,
        response === "accept" ? ack : true,
        response === "request-changes" ? changeMsg : undefined
      );
      setResult({ ok: res.ok, text: res.message });
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="cq-respond">
      <h2>Your response</h2>

      {result && (
        <div
          className={`cq-banner ${result.ok ? "cq-banner-ok" : "cq-banner-warn"}`}
          role="status"
        >
          {result.text}
        </div>
      )}

      {!result?.ok && (
        <>
          <div className="cq-response-buttons">
            <button
              type="button"
              className={`cq-btn ${mode === "accept" ? "is-active" : ""}`}
              onClick={() => setMode("accept")}
              disabled={pending}
            >
              Accept
            </button>
            <button
              type="button"
              className={`cq-btn ${mode === "request-changes" ? "is-active" : ""}`}
              onClick={() => setMode("request-changes")}
              disabled={pending}
            >
              Request changes
            </button>
            <button
              type="button"
              className={`cq-btn ${mode === "decline" ? "is-active" : ""}`}
              onClick={() => setMode("decline")}
              disabled={pending}
            >
              Decline
            </button>
          </div>

          {mode === "accept" && (
            <div className="cq-confirm">
              <label className="cq-check">
                <input
                  type="checkbox"
                  checked={ack}
                  onChange={(e) => setAck(e.target.checked)}
                />
                <span>
                  I have read and accept the terms of this quotation
                  {termsText ? " set out above" : ""}.
                </span>
              </label>
              <button
                type="button"
                className="cq-btn cq-btn-primary"
                disabled={pending || !ack}
                onClick={() => submit("accept")}
              >
                {pending ? "Submitting…" : "Confirm acceptance"}
              </button>
            </div>
          )}

          {mode === "request-changes" && (
            <div className="cq-confirm">
              <label htmlFor="cq-change">What would you like changed?</label>
              <textarea
                id="cq-change"
                rows={3}
                value={changeMsg}
                onChange={(e) => setChangeMsg(e.target.value)}
              />
              <button
                type="button"
                className="cq-btn cq-btn-primary"
                disabled={pending || !changeMsg.trim()}
                onClick={() => submit("request-changes")}
              >
                {pending ? "Submitting…" : "Send change request"}
              </button>
            </div>
          )}

          {mode === "decline" && (
            <div className="cq-confirm">
              <p>Are you sure you want to decline this quotation?</p>
              <button
                type="button"
                className="cq-btn cq-btn-primary"
                disabled={pending}
                onClick={() => submit("decline")}
              >
                {pending ? "Submitting…" : "Confirm decline"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
