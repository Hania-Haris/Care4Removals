import type { Metadata } from "next";
import Link from "next/link";
import { listLeads, LEAD_STATUSES } from "@/lib/data/leads";
import type { LeadStatus, LeadSource } from "@/lib/types";

export const metadata: Metadata = { title: "Leads" };
export const dynamic = "force-dynamic";

type SearchParams = {
  status?: string;
  source?: string;
  cursor?: string;
  q?: string;
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const status =
    sp.status && LEAD_STATUSES.includes(sp.status as LeadStatus)
      ? (sp.status as LeadStatus)
      : undefined;
  const source =
    sp.source === "quote-form" || sp.source === "contact-form"
      ? (sp.source as LeadSource)
      : undefined;
  const q = sp.q?.trim().toLowerCase() ?? "";

  const page = await listLeads({ status, source, cursor: sp.cursor });

  // Free-text search is applied in-memory over the current page only — a
  // proper search index (e.g. Typesense/Algolia) is out of scope for v1;
  // the filters above are the primary narrowing tool.
  const items = q
    ? page.items.filter((l) =>
        [l.customerName, l.email, l.phone, l.pickupAddress, l.deliveryAddress]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q))
      )
    : page.items;

  const qs = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    if (source) p.set("source", source);
    if (q) p.set("q", q);
    for (const [k, v] of Object.entries(extra)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  return (
    <div className="admin-page">
      <h1>Leads</h1>

      <form className="admin-filters" method="get">
        <input
          type="search"
          name="q"
          placeholder="Search name, email, phone, address…"
          defaultValue={q}
          aria-label="Search leads"
        />
        <select name="status" defaultValue={status ?? ""} aria-label="Status">
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select name="source" defaultValue={source ?? ""} aria-label="Source">
          <option value="">All sources</option>
          <option value="quote-form">Quote form</option>
          <option value="contact-form">Contact form</option>
        </select>
        <button type="submit" className="btn btn-primary">
          Apply
        </button>
        {(status || source || q) && (
          <Link href="/admin/leads" className="admin-filter-clear">
            Clear
          </Link>
        )}
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Source</th>
            <th>Move date</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Received</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={6} className="admin-empty">
                {q || status || source
                  ? "No leads match these filters."
                  : "No leads yet."}
              </td>
            </tr>
          )}
          {items.map((lead) => (
            <tr key={lead.id}>
              <td>
                <Link href={`/admin/leads/${lead.id}`}>
                  {lead.customerName || "—"}
                </Link>
                <div className="admin-muted">{lead.email}</div>
              </td>
              <td>{lead.source === "quote-form" ? "Quote" : "Contact"}</td>
              <td className="admin-muted">{lead.movingDate ?? "—"}</td>
              <td>
                {lead.priority === "high" ? (
                  <span className="admin-badge priority-high">High</span>
                ) : (
                  <span className="admin-muted">Normal</span>
                )}
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

      <div className="admin-pagination">
        {sp.cursor && (
          <Link href={`/admin/leads${qs({ cursor: undefined })}`}>
            ← First page
          </Link>
        )}
        {page.hasMore && page.nextCursor && (
          <Link href={`/admin/leads${qs({ cursor: page.nextCursor })}`}>
            Next page →
          </Link>
        )}
      </div>
    </div>
  );
}
