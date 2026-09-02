"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  saveQuoteDraft,
  sendQuote,
  setQuoteStatus,
  type DraftInput,
} from "@/app/actions/quotes";
import { formatPence } from "@/lib/quote/calc";
import type { LineItem, QuoteStatus } from "@/lib/types";

type Row = {
  description: string;
  category: string;
  quantity: string;
  unitPrice: string; // pounds, as typed
};

const CATEGORIES = [
  "Labour",
  "Vehicle",
  "Mileage",
  "Packing",
  "Materials",
  "Dismantling / reassembly",
  "Storage",
  "Heavy items",
  "Access surcharge",
  "Other service",
  "Discount",
];

function rowsFromLineItems(items: LineItem[]): Row[] {
  if (!items.length)
    return [{ description: "", category: "Labour", quantity: "1", unitPrice: "" }];
  return items.map((it) => ({
    description: it.description,
    category: it.category,
    quantity: String(it.quantity),
    unitPrice: (it.unitPrice / 100).toFixed(2),
  }));
}

export default function QuoteBuilder({
  quoteId,
  status,
  managerReviewRequired,
  initial,
}: {
  quoteId: string;
  status: QuoteStatus;
  managerReviewRequired: boolean;
  initial: {
    lineItems: LineItem[];
    assumptions: string;
    exclusions: string;
    paymentTerms: string;
    cancellationTerms: string;
    overrideReason: string | null;
    vatMode: string;
  };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [rows, setRows] = useState<Row[]>(rowsFromLineItems(initial.lineItems));
  const [assumptions, setAssumptions] = useState(initial.assumptions);
  const [exclusions, setExclusions] = useState(initial.exclusions);
  const [paymentTerms, setPaymentTerms] = useState(initial.paymentTerms);
  const [cancellationTerms, setCancellationTerms] = useState(
    initial.cancellationTerms
  );
  const [overrideReason, setOverrideReason] = useState(
    initial.overrideReason ?? ""
  );

  const locked = ["accepted", "declined", "converted-to-job"].includes(status);

  const parsedRows = rows.map((r) => ({
    description: r.description,
    category: r.category,
    quantity: parseFloat(r.quantity) || 0,
    unitPrice: Math.round((parseFloat(r.unitPrice) || 0) * 100),
  }));
  const preview = parsedRows.reduce(
    (sum, r) => sum + r.quantity * r.unitPrice,
    0
  );

  function update(i: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function addRow() {
    setRows((rs) => [
      ...rs,
      { description: "", category: "Labour", quantity: "1", unitPrice: "" },
    ]);
  }
  function removeRow(i: number) {
    setRows((rs) => (rs.length > 1 ? rs.filter((_, idx) => idx !== i) : rs));
  }

  function buildDraft(): DraftInput {
    return {
      lineItems: parsedRows,
      assumptions,
      exclusions,
      paymentTerms,
      cancellationTerms,
      overrideReason: overrideReason.trim() || undefined,
    };
  }

  function run(fn: () => Promise<{ ok: boolean; message: string }>) {
    setMsg(null);
    startTransition(async () => {
      const res = await fn();
      setMsg({ ok: res.ok, text: res.message });
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="admin-manage">
      {msg && (
        <div className={`admin-inline-msg ${msg.ok ? "ok" : "err"}`} role="status">
          {msg.text}
        </div>
      )}

      {locked && (
        <p className="admin-muted">
          This quote is {status} and can no longer be edited. Earlier issued
          versions remain viewable below.
        </p>
      )}

      <table className="admin-table quote-line-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Category</th>
            <th>Qty</th>
            <th>Unit £</th>
            <th>Line</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>
                <input
                  value={r.description}
                  disabled={locked}
                  onChange={(e) => update(i, { description: e.target.value })}
                />
              </td>
              <td>
                <select
                  value={r.category}
                  disabled={locked}
                  onChange={(e) => update(i, { category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={r.quantity}
                  disabled={locked}
                  onChange={(e) => update(i, { quantity: e.target.value })}
                />
              </td>
              <td>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={r.unitPrice}
                  disabled={locked}
                  onChange={(e) => update(i, { unitPrice: e.target.value })}
                />
              </td>
              <td className="admin-muted">
                {formatPence(parsedRows[i]!.quantity * parsedRows[i]!.unitPrice)}
              </td>
              <td>
                {!locked && rows.length > 1 && (
                  <button
                    type="button"
                    className="admin-row-remove"
                    onClick={() => removeRow(i)}
                    aria-label="Remove line"
                  >
                    ✕
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!locked && (
        <button type="button" className="admin-add-row" onClick={addRow}>
          + Add line
        </button>
      )}

      <p className="quote-preview-total">
        Preview total (before tax adjustment): <strong>{formatPence(preview)}</strong>
        <span className="admin-muted"> — VAT mode: {initial.vatMode}</span>
      </p>

      <div className="admin-manage-block">
        <label>Assumptions</label>
        <textarea
          rows={2}
          value={assumptions}
          disabled={locked}
          onChange={(e) => setAssumptions(e.target.value)}
        />
      </div>
      <div className="admin-manage-block">
        <label>Exclusions</label>
        <textarea
          rows={2}
          value={exclusions}
          disabled={locked}
          onChange={(e) => setExclusions(e.target.value)}
        />
      </div>
      <div className="admin-manage-block">
        <label>Payment terms</label>
        <textarea
          rows={2}
          value={paymentTerms}
          disabled={locked}
          onChange={(e) => setPaymentTerms(e.target.value)}
        />
      </div>
      <div className="admin-manage-block">
        <label>Cancellation / other terms</label>
        <textarea
          rows={3}
          value={cancellationTerms}
          disabled={locked}
          onChange={(e) => setCancellationTerms(e.target.value)}
        />
      </div>
      <div className="admin-manage-block">
        <label>Manual override reason (required if you hand-adjust pricing)</label>
        <input
          value={overrideReason}
          disabled={locked}
          onChange={(e) => setOverrideReason(e.target.value)}
          placeholder="e.g. matched a competitor quote; goodwill discount"
        />
      </div>

      {!locked && (
        <div className="admin-inline-row quote-actions">
          <button
            type="button"
            className="btn"
            disabled={pending}
            onClick={() => run(() => saveQuoteDraft(quoteId, buildDraft()))}
          >
            Save draft
          </button>

          {managerReviewRequired && status === "draft" && (
            <button
              type="button"
              className="btn"
              disabled={pending}
              onClick={() =>
                run(async () => {
                  await saveQuoteDraft(quoteId, buildDraft());
                  return setQuoteStatus(quoteId, "ready-for-review");
                })
              }
            >
              Mark ready for review
            </button>
          )}

          <button
            type="button"
            className="btn btn-primary"
            disabled={pending}
            onClick={() =>
              run(async () => {
                const saved = await saveQuoteDraft(quoteId, buildDraft());
                if (!saved.ok) return saved;
                return sendQuote(quoteId);
              })
            }
          >
            {status === "sent" || status === "viewed" || status === "changes-requested"
              ? "Save & send revised version"
              : "Save & send to customer"}
          </button>
        </div>
      )}
    </div>
  );
}
