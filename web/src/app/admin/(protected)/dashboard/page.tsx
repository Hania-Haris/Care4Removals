import type { Metadata } from "next";
import Link from "next/link";
import { getLeadStatusCounts, listLeads } from "@/lib/data/leads";

export const metadata: Metadata = { title: "Dashboard" };

// Always fresh — staff need current numbers.
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [counts, recent] = await Promise.all([
    getLeadStatusCounts(),
    listLeads({}),
  ]);

  const tiles: { label: string; key: keyof typeof counts }[] = [
    { label: "New", key: "new" },
    { label: "Contacted", key: "contacted" },
    { label: "Qualified", key: "qualified" },
    { label: "Quote in prep", key: "quote-in-preparation" },
    { label: "Quote sent", key: "quote-sent" },
    { label: "Won", key: "won" },
  ];

  return (
    <div className="admin-page">
      <h1>Dashboard</h1>

      <div className="admin-stat-grid">
        {tiles.map((t) => (
          <Link
            key={t.key}
            href={`/admin/leads?status=${t.key}`}
            className="admin-stat-tile"
          >
            <span className="admin-stat-value">{counts[t.key]}</span>
            <span className="admin-stat-label">{t.label}</span>
          </Link>
        ))}
      </div>

      <div className="admin-section-head">
        <h2>Recent enquiries</h2>
        <Link href="/admin/leads">View all →</Link>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Source</th>
            <th>Route</th>
            <th>Status</th>
            <th>Received</th>
          </tr>
        </thead>
        <tbody>
          {recent.items.length === 0 && (
            <tr>
              <td colSpan={5} className="admin-empty">
                No enquiries yet.
              </td>
            </tr>
          )}
          {recent.items.map((lead) => (
            <tr key={lead.id}>
              <td>
                <Link href={`/admin/leads/${lead.id}`}>
                  {lead.customerName || "—"}
                </Link>
                <div className="admin-muted">{lead.email}</div>
              </td>
              <td>{lead.source === "quote-form" ? "Quote" : "Contact"}</td>
              <td className="admin-muted">
                {lead.source === "quote-form"
                  ? `${lead.pickupAddress ?? "?"} → ${lead.deliveryAddress ?? "?"}`
                  : (lead.subject ?? "—")}
              </td>
              <td>
                <span className={`admin-badge status-${lead.status}`}>
                  {lead.status}
                </span>
              </td>
              <td className="admin-muted">
                {lead.createdAt
                  ? new Date(lead.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
