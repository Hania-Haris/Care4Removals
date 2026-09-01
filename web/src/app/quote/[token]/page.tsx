import type { Metadata } from "next";
import {
  getCustomerQuoteView,
  recordQuoteViewed,
} from "@/lib/data/customer-quote";
import { formatPence } from "@/lib/quote/calc";
import CustomerResponsePanel from "@/components/CustomerResponsePanel";
import "../../site.css";
import "./quote-view.css";

export const metadata: Metadata = {
  title: "Your quotation",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CustomerQuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const view = await getCustomerQuoteView(token);

  if (!view) {
    return (
      <main className="cq-shell">
        <div className="cq-card cq-invalid">
          <h1>This link isn&apos;t valid</h1>
          <p>
            The quotation link you followed is invalid or has been revoked. If
            you think this is a mistake, please contact us and we&apos;ll send
            a fresh link.
          </p>
        </div>
      </main>
    );
  }

  // Best-effort: mark as viewed the first time.
  await recordQuoteViewed(token);

  const v = view.version;

  return (
    <main className="cq-shell">
      <div className="cq-card">
        <header className="cq-head">
          <div className="cq-brand">
            care4<span>removals</span>
          </div>
          <div className="cq-meta">
            <div>Quotation {view.quoteNumber}</div>
            {v && <div>Version {v.versionNumber}</div>}
            {view.expiresAt && (
              <div>
                Valid until{" "}
                {new Date(view.expiresAt).toLocaleDateString("en-GB")}
              </div>
            )}
          </div>
        </header>

        <h1>Hi {view.customerName || "there"}, here&apos;s your quotation</h1>

        {view.expired && (
          <div className="cq-banner cq-banner-warn">
            This quotation has expired. Please contact us for an updated quote.
          </div>
        )}
        {!view.expired && view.status === "accepted" && (
          <div className="cq-banner cq-banner-ok">
            You accepted this quotation. We&apos;ll be in touch to confirm the
            details.
          </div>
        )}
        {!view.expired && view.status === "declined" && (
          <div className="cq-banner">You declined this quotation.</div>
        )}
        {!view.expired && view.status === "changes-requested" && (
          <div className="cq-banner">
            You&apos;ve requested changes. We&apos;ll review and send an
            updated quotation.
          </div>
        )}

        {v && (
          <>
            <table className="cq-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {v.lineItems.map((li, i) => (
                  <tr key={i}>
                    <td>
                      {li.description || li.category}
                      <span className="cq-cat">{li.category}</span>
                    </td>
                    <td>{li.quantity}</td>
                    <td>{formatPence(li.unitPrice)}</td>
                    <td>{formatPence(li.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>Subtotal</td>
                  <td>{formatPence(v.subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan={3}>
                    {v.vatMode === "none"
                      ? "VAT (not applicable)"
                      : v.vatMode === "inclusive"
                        ? "VAT (included)"
                        : "VAT (20%)"}
                  </td>
                  <td>{formatPence(v.tax)}</td>
                </tr>
                <tr className="cq-total">
                  <td colSpan={3}>Total</td>
                  <td>{formatPence(v.total)}</td>
                </tr>
              </tfoot>
            </table>

            {v.paymentTerms && (
              <section className="cq-terms">
                <h2>Payment terms</h2>
                <p>{v.paymentTerms}</p>
              </section>
            )}
            {v.assumptions && (
              <section className="cq-terms">
                <h2>Assumptions</h2>
                <p>{v.assumptions}</p>
              </section>
            )}
            {v.exclusions && (
              <section className="cq-terms">
                <h2>Exclusions</h2>
                <p>{v.exclusions}</p>
              </section>
            )}
            {v.cancellationTerms && (
              <section className="cq-terms">
                <h2>Terms &amp; conditions</h2>
                <p>{v.cancellationTerms}</p>
              </section>
            )}

            {view.hasPdf && (
              <p className="cq-pdf">
                <a href={`/api/quote-pdf/${token}`} target="_blank" rel="noreferrer">
                  Download PDF copy →
                </a>
              </p>
            )}
          </>
        )}

        <CustomerResponsePanel
          token={token}
          respondable={view.respondable}
          currentStatus={view.status}
          termsText={v?.cancellationTerms ?? ""}
        />

        <footer className="cq-foot">
          This quotation is private to you — please don&apos;t forward this
          link. Questions? Reply to the email this came from.
        </footer>
      </div>
    </main>
  );
}
