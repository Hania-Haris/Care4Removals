"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateLeadStatus,
  assignLead,
  addInternalNote,
  logContactActivity,
} from "@/app/actions/admin";
import type { LeadStatus } from "@/lib/types";

type StaffOption = { uid: string; email: string; displayName: string };

export default function LeadManagePanel({
  leadId,
  currentStatus,
  allowedStatuses,
  assignedTo,
  staff,
  canWrite,
}: {
  leadId: string;
  currentStatus: LeadStatus;
  allowedStatuses: LeadStatus[];
  assignedTo: string | null;
  staff: StaffOption[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [status, setStatus] = useState<LeadStatus>(currentStatus);
  const [assignee, setAssignee] = useState(assignedTo ?? "");
  const [note, setNote] = useState("");
  const [logKind, setLogKind] = useState<"call" | "email">("call");
  const [logSummary, setLogSummary] = useState("");

  function run(fn: () => Promise<{ ok: boolean; message: string }>) {
    setMsg(null);
    startTransition(async () => {
      const res = await fn();
      setMsg({ ok: res.ok, text: res.message });
      if (res.ok) router.refresh();
    });
  }

  if (!canWrite) {
    return (
      <p className="admin-muted">
        Your role ({"viewer"}) is read-only — status, assignment and notes
        can&apos;t be changed.
      </p>
    );
  }

  return (
    <div className="admin-manage">
      {msg && (
        <div
          className={`admin-inline-msg ${msg.ok ? "ok" : "err"}`}
          role="status"
        >
          {msg.text}
        </div>
      )}

      <div className="admin-manage-block">
        <label htmlFor="lead-status">Status</label>
        <div className="admin-inline-row">
          <select
            id="lead-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as LeadStatus)}
          >
            <option value={currentStatus}>{currentStatus} (current)</option>
            {allowedStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-primary"
            disabled={pending || status === currentStatus}
            onClick={() => run(() => updateLeadStatus(leadId, status))}
          >
            Update
          </button>
        </div>
      </div>

      <div className="admin-manage-block">
        <label htmlFor="lead-assignee">Assigned to</label>
        <div className="admin-inline-row">
          <select
            id="lead-assignee"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          >
            <option value="">Unassigned</option>
            {staff.map((s) => (
              <option key={s.uid} value={s.uid}>
                {s.displayName}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-primary"
            disabled={pending || assignee === (assignedTo ?? "")}
            onClick={() => run(() => assignLead(leadId, assignee || null))}
          >
            Save
          </button>
        </div>
      </div>

      <div className="admin-manage-block">
        <label htmlFor="lead-note">Add internal note</label>
        <p className="admin-muted admin-note-hint">
          Internal only — never shown to the customer.
        </p>
        <textarea
          id="lead-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
        />
        <button
          type="button"
          className="btn btn-primary"
          disabled={pending || !note.trim()}
          onClick={() =>
            run(async () => {
              const r = await addInternalNote(leadId, note);
              if (r.ok) setNote("");
              return r;
            })
          }
        >
          Add note
        </button>
      </div>

      <div className="admin-manage-block">
        <label htmlFor="lead-log">Log a call or email</label>
        <p className="admin-muted admin-note-hint">
          Records that contact happened, with your summary. Doesn&apos;t send
          anything.
        </p>
        <div className="admin-inline-row">
          <select
            id="lead-log"
            value={logKind}
            onChange={(e) => setLogKind(e.target.value as "call" | "email")}
          >
            <option value="call">Call</option>
            <option value="email">Email</option>
          </select>
        </div>
        <textarea
          value={logSummary}
          onChange={(e) => setLogSummary(e.target.value)}
          rows={2}
          placeholder="What was discussed / sent"
        />
        <button
          type="button"
          className="btn btn-primary"
          disabled={pending || !logSummary.trim()}
          onClick={() =>
            run(async () => {
              const r = await logContactActivity(leadId, logKind, logSummary);
              if (r.ok) setLogSummary("");
              return r;
            })
          }
        >
          Log {logKind}
        </button>
      </div>
    </div>
  );
}
