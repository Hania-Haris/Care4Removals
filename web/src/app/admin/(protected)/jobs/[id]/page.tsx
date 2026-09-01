import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJob } from "@/lib/data/jobs";
import { JOB_TRANSITIONS } from "@/lib/data/job-constants";
import { getSessionUser, canWrite } from "@/lib/auth/session";
import { formatPence } from "@/lib/quote/calc";
import JobStatusControl from "@/components/admin/JobStatusControl";

export const metadata: Metadata = { title: "Job" };
export const dynamic = "force-dynamic";

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [job, user] = await Promise.all([getJob(id), getSessionUser()]);
  if (!job) notFound();
  const writable = user ? canWrite(user.role) : false;
  const s = job.snapshot;

  return (
    <div className="admin-page">
      <Link href={`/admin/quotes/${job.quoteId}`} className="admin-back">
        ← Source quote
      </Link>

      <div className="admin-detail-head">
        <div>
          <h1>{s.customerName || "Job"}</h1>
          <p className="admin-muted">
            Job from quote · Created{" "}
            {job.createdAt
              ? new Date(job.createdAt).toLocaleString("en-GB")
              : "—"}
          </p>
        </div>
        <span className={`admin-badge status-${job.status}`}>{job.status}</span>
      </div>

      <div className="admin-detail-grid">
        <section className="admin-card">
          <h2>Accepted scope (frozen snapshot)</h2>
          <dl className="admin-dl">
            <div>
              <dt>Customer</dt>
              <dd>
                {s.customerName}
                <br />
                {s.customerEmail}
                <br />
                {s.customerPhone}
              </dd>
            </div>
            <div>
              <dt>From</dt>
              <dd>{s.pickupAddress || "—"}</dd>
            </div>
            <div>
              <dt>To</dt>
              <dd>{s.deliveryAddress || "—"}</dd>
            </div>
            <div>
              <dt>Move date</dt>
              <dd>{s.movingDate || "Not specified"}</dd>
            </div>
            <div>
              <dt>Service</dt>
              <dd>{s.serviceType || "Not specified"}</dd>
            </div>
            <div>
              <dt>Agreed total</dt>
              <dd>
                <strong>{formatPence(s.total)}</strong>
              </dd>
            </div>
          </dl>
          <p className="admin-muted">
            This snapshot is fixed at conversion. Later edits to the quote
            can&apos;t change it.
          </p>
        </section>

        <section className="admin-card">
          <h2>Job status</h2>
          {writable ? (
            <JobStatusControl
              jobId={job.id}
              current={job.status}
              allowed={JOB_TRANSITIONS[job.status] ?? []}
            />
          ) : (
            <p className="admin-muted">Read-only for your role.</p>
          )}
        </section>

        <section className="admin-card admin-card-wide">
          <h2>Line items</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {s.lineItems?.map((li, i) => (
                <tr key={i}>
                  <td>{li.description || "—"}</td>
                  <td>{li.category}</td>
                  <td>{li.quantity}</td>
                  <td>{formatPence(li.unitPrice)}</td>
                  <td>{formatPence(li.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
