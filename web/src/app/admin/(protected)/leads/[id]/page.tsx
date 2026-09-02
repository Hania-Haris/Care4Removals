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
import { getQuoteByLead } from "@/lib/data/quotes";
import LeadManagePanel from "@/components/admin/LeadManagePanel";
import StartQuoteButton from "@/components/admin/StartQuoteButton";

export const metadata: Metadata = { title: "Lead" };
export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [lead, activities, staff, user, quote] = await Promise.all([
    getLead(id),
    getLeadActivities(id),
    listStaffUsers(),
    getSessionUser(),
    getQuoteByLead(id),
  ]);

  if (!lead) notFound();

  const writable = user ? canWrite(user.role) : false;
  const assignedName =
    staff.find((s) => s.uid === lead.assignedTo)?.displayName ?? null;

  const floorText = (floor?: string | null, lift?: string | null, legacy?: string) => {
    const parts = [floor || (legacy ? `Ground floor: ${legacy}` : null), lift].filter(Boolean);
    return parts.length ? parts.join(" · ") : "Not specified";
  };

  const detailRows: [string, string | undefined | null][] =
    lead.source === "quote-form"
      ? [
          ["Phone", lead.phone],
          ["Email", lead.email],
          ["Moving date", lead.movingDate || "Flexible / not set"],
          ["Dates flexible", lead.dateFlexible ? "Yes" : "No"],
          ["Main service", lead.serviceType || "Not specified"],
          ["From", `${lead.pickupAddress ?? ""}${lead.pickupPostcode ? ", " + lead.pickupPostcode : ""}`],
          ["From — property", `${lead.pickupPropertyType ?? "—"}${lead.pickupBedrooms ? " · " + lead.pickupBedrooms : ""}`],
          ["From — access", floorText(lead.pickupFloor, lead.pickupLift, lead.pickupGroundFloor)],
          ["From — parking notes", lead.pickupAccess || "None"],
          ["To", `${lead.deliveryAddress ?? ""}${lead.deliveryPostcode ? ", " + lead.deliveryPostcode : ""}`],
          ["To — property", lead.deliveryPropertyType ?? "—"],
          ["To — access", floorText(lead.deliveryFloor, lead.deliveryLift, lead.deliveryGroundFloor)],
          ["To — parking notes", lead.deliveryAccess || "None"],
          ["Packing", lead.packingNeeded || "Not specified"],
          ["Dismantling / reassembly", lead.dismantlingNeeded || "Not specified"],
          ["Storage", lead.storageNeeded || "Not specified"],
          ["Heavy / special items", lead.heavyItems || "None noted"],
          ["Approximate inventory", lead.inventoryNotes || "None provided"],
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

          {(lead.uploadedFiles?.length ?? 0) > 0 && (
            <div className="admin-lead-files">
              <dt>Attachments ({lead.uploadedFiles!.length})</dt>
              <ul>
                {lead.uploadedFiles!.map((f) => (
                  <li key={f.path}>
                    <a
                      href={`/api/admin/lead-file?path=${encodeURIComponent(f.path)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {f.name}
                    </a>
                    <span className="admin-muted">
                      {" "}
                      ({Math.round(f.size / 1024)} KB)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {lead.source === "quote-form" && (
            <div className="admin-quote-cta">
              {quote ? (
                <Link
                  href={`/admin/quotes/${quote.id}`}
                  className="btn btn-primary"
                >
                  Open quote {quote.quoteNumber} ({quote.status})
                </Link>
              ) : writable &&
                ["qualified", "quote-in-preparation"].includes(lead.status) ? (
                <StartQuoteButton leadId={lead.id} />
              ) : (
                <p className="admin-muted">
                  Qualify this lead to start a quotation.
                </p>
              )}
            </div>
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
