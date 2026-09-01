import type { Metadata } from "next";
import Link from "next/link";
import { listJobs } from "@/lib/data/jobs";
import { JOB_STATUSES } from "@/lib/data/job-constants";
import { formatPence } from "@/lib/quote/calc";
import type { JobStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Jobs" };
export const dynamic = "force-dynamic";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status =
    sp.status && JOB_STATUSES.includes(sp.status as JobStatus)
      ? (sp.status as JobStatus)
      : undefined;
  const jobs = await listJobs(status);

  return (
    <div className="admin-page">
      <h1>Jobs</h1>

      <form className="admin-filters" method="get">
        <select name="status" defaultValue={status ?? ""} aria-label="Status">
          <option value="">All statuses</option>
          {JOB_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary">
          Apply
        </button>
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Route</th>
            <th>Move date</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 && (
            <tr>
              <td colSpan={5} className="admin-empty">
                No jobs yet.
              </td>
            </tr>
          )}
          {jobs.map((j) => (
            <tr key={j.id}>
              <td>
                <Link href={`/admin/jobs/${j.id}`}>
                  {j.snapshot.customerName || "—"}
                </Link>
              </td>
              <td className="admin-muted">
                {j.snapshot.pickupAddress} → {j.snapshot.deliveryAddress}
              </td>
              <td className="admin-muted">
                {j.snapshot.movingDate ?? "—"}
              </td>
              <td>{formatPence(j.snapshot.total)}</td>
              <td>
                <span className={`admin-badge status-${j.status}`}>
                  {j.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
