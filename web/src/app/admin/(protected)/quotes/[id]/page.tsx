import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminDb } from "@/lib/firebase/admin";
import { getQuote, listQuoteVersions } from "@/lib/data/quotes";
import { getJobByQuote } from "@/lib/data/jobs";
import { getSettings } from "@/lib/settings";
import { formatPence } from "@/lib/quote/calc";
import QuoteBuilder from "@/components/admin/QuoteBuilder";
import ConvertToJobButton from "@/components/admin/ConvertToJobButton";
import ResendQuoteButton from "@/components/admin/ResendQuoteButton";
import type { LineItem } from "@/lib/types";

export const metadata: Metadata = { title: "Quote" };
export const dynamic = "force-dynamic";

export default async function QuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [quote, versions, settings, job] = await Promise.all([
    getQuote(id),
    listQuoteVersions(id),
    getSettings(),
    getJobByQuote(id),
  ]);
  if (!quote) notFound();

  // Draft fields live on the quote doc until a version is issued.
  const draftSnap = await getAdminDb().collection("quotes").doc(id).get();
  const d = draftSnap.data() ?? {};

  const initial = {
    lineItems: (d.draftLineItems as LineItem[]) ?? [],
    assumptions: d.draftAssumptions ?? "",
    exclusions: d.draftExclusions ?? "",
    paymentTerms: d.draftPaymentTerms ?? "",
    cancellationTerms: d.draftCancellationTerms ?? settings.termsText,
    overrideReason: d.draftOverrideReason ?? null,
    vatMode: settings.vatMode,
  };

  return (
    <div className="admin-page">
      <Link href={`/admin/leads/${quote.leadId}`} className="admin-back">
        ← Back to lead
      </Link>

      <div className="admin-detail-head">
        <div>
          <h1>{quote.quoteNumber}</h1>
          <p className="admin-muted">
            {quote.customerName} · {quote.customerEmail} ·{" "}
            {quote.expiresAt
              ? `Expires ${new Date(quote.expiresAt).toLocaleDateString("en-GB")}`
              : "No expiry set"}
          </p>
        </div>
        <span className={`admin-badge status-${quote.status}`}>
          {quote.status}
        </span>
      </div>

      {(["sent", "viewed", "changes-requested", "accepted", "declined", "converted-to-job"].includes(
        quote.status
      ) ||
        job) && (
        <section className="admin-card admin-card-wide admin-quote-actions-bar">
          {job ? (
            <Link href={`/admin/jobs/${job.id}`} className="btn btn-primary">
              Open job ({job.status})
            </Link>
          ) : quote.status === "accepted" ? (
            <ConvertToJobButton quoteId={quote.id} />
          ) : null}
          {["sent", "viewed", "changes-requested"].includes(quote.status) && (
            <ResendQuoteButton quoteId={quote.id} />
          )}
        </section>
      )}

      <div className="admin-detail-grid">
        <section className="admin-card admin-card-wide">
          <h2>Quotation</h2>
          <QuoteBuilder
            quoteId={quote.id}
            status={quote.status}
            managerReviewRequired={settings.managerReviewRequired}
            initial={initial}
          />
        </section>

        <section className="admin-card admin-card-wide">
          <h2>Issued versions</h2>
          {versions.length === 0 && (
            <p className="admin-muted">
              No versions issued yet. &ldquo;Save &amp; send&rdquo; creates the
              first immutable version.
            </p>
          )}
          <ul className="admin-timeline">
            {versions.map((v) => (
              <li key={v.id}>
                <span className="admin-timeline-type">
                  Version {v.versionNumber} — {formatPence(v.total)}
                </span>
                <span className="admin-timeline-meta">
                  Issued{" "}
                  {v.issuedAt
                    ? new Date(v.issuedAt).toLocaleString("en-GB")
                    : "—"}
                  {v.overrideReason ? ` · override: ${v.overrideReason}` : ""}
                </span>
                <div className="admin-timeline-body">
                  {v.lineItems.map((li, idx) => (
                    <div key={idx}>
                      {li.description || li.category} × {li.quantity} @{" "}
                      {formatPence(li.unitPrice)} = {formatPence(li.total)}
                    </div>
                  ))}
                  <div>
                    Subtotal {formatPence(v.subtotal)} · Tax{" "}
                    {formatPence(v.tax)} · <strong>Total {formatPence(v.total)}</strong>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
