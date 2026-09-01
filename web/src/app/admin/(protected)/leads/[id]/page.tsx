import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getLead,
  getLeadActivities,
  listStaffUsers,
  LEAD_TRANSITIONS,
} from "@/lib/data/leads";
import { getSessionUser, canWrite } from "@/lib/auth/session";
import LeadManagePanel from "@/components/admin/LeadManagePanel";

export const metadata: Metadata = { title: "Lead" };
export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [lead, activities, staff, user] = await Promise.all([
    getLead(id),
    getLeadActivities(id),
    listStaffUsers(),
    getSessionUser(),
  ]);

  if (!lead) notFound();

  const writable = user ? canWrite(user.role) : false;
  const assignedName =
    staff.find((s) => s.uid === lead.assignedTo)?.displayName ?? null;

  const detailRows: [string, string | undefined][] =
    lead.source === "quote-form"
      ? [
          ["Phone", lead.phone],
          ["Email", lead.email],
          ["Moving date", lead.movingDate || "Not specified"],
          ["Service", lead.serviceType || "Not specified"],
          ["From", lead.pickupAddress],
          ["From — property", lead.pickupPropertyType],
          ["From — ground floor", lead.pickupGroundFloor || "Not specified"],
          ["To", lead.deliveryAddress],
          ["To — property", lead.deliveryPropertyType],
          ["To — ground floor", lead.deliveryGroundFloor || "Not specified"],
          ["Special instructions", lead.specialInstructions || "None"],
        ]
      : [
          ["Phone", lead.phone],
          ["Email", lead.email],
          ["Subject", lead.subject],
          ["Message", lead.message],
        ];

  return (
    <div className="admin-page">
      <Link href="/admin/leads" className="admin-back">
        ← Leads
      </Link>

      <div className="admin-detail-head">
        <div>
          <h1>{lead.customerName || "Unnamed enquiry"}</h1>
          <p className="admin-muted">
            {lead.source === "quote-form" ? "Quote request" : "Contact message"}
            {" · "}
            Received{" "}
            {lead.createdAt
              ? new Date(lead.createdAt).toLocaleString("en-GB")
              : "unknown"}
            {assignedName ? ` · Assigned to ${assignedName}` : " · Unassigned"}
          </p>
        </div>
        <span className={`admin-badge status-${lead.status}`}>
          {lead.status}
        </span>
      </div>

      <div className="admin-detail-grid">
        <section className="admin-card">
          <h2>Enquiry details</h2>
          <dl className="admin-dl">
            {detailRows.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value || "—"}</dd>
              </div>
            ))}
          </dl>
          {lead.source === "quote-form" && lead.status === "qualified" && (
            <p className="admin-muted">
              Ready to quote — the quotation builder arrives in Phase 6.
            </p>
          )}
        </section>

        <section className="admin-card">
          <h2>Manage</h2>
          <LeadManagePanel
            leadId={lead.id}
            currentStatus={lead.status}
            allowedStatuses={LEAD_TRANSITIONS[lead.status] ?? []}
            assignedTo={lead.assignedTo ?? null}
            staff={staff}
            canWrite={writable}
          />
        </section>

        <section className="admin-card admin-card-wide">
          <h2>Activity</h2>
          {activities.length === 0 && (
            <p className="admin-muted">No activity yet.</p>
          )}
          <ul className="admin-timeline">
            {activities.map((a) => (
              <li key={a.id}>
                <span className="admin-timeline-type">{a.type}</span>
                <span className="admin-timeline-meta">
                  {a.createdAt
                    ? new Date(a.createdAt).toLocaleString("en-GB")
                    : ""}
                  {a.actor !== "system" && a.actor !== "customer"
                    ? ` · ${(a.metadata.authorEmail as string) ?? "staff"}`
                    : ` · ${a.actor}`}
                </span>
                {typeof a.metadata.text === "string" && (
                  <p className="admin-timeline-body">{a.metadata.text}</p>
                )}
                {typeof a.metadata.summary === "string" && (
                  <p className="admin-timeline-body">{a.metadata.summary}</p>
                )}
                {typeof a.metadata.from === "string" && (
                  <p className="admin-timeline-body">
                    {a.metadata.from as string} → {a.metadata.to as string}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
