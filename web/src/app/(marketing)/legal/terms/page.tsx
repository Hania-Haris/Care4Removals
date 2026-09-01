import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that apply to using the Care4Removals website and services.",
};

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const settings = await getSettings();
  return (
    <main className="legal-page">
      <div className="container">
        <p className="legal-draft">
          Draft — final terms are being confirmed with legal review before
          launch (Phase 10). Do not treat this as the binding contract.
        </p>
        <h1>Terms of Service</h1>

        <h2>Enquiries and quotations</h2>
        <p>
          Submitting an enquiry does not create a contract. A quotation we send
          is an offer valid for the period stated on it (currently{" "}
          {settings.quoteValidityDays} days). A booking is formed only when you
          accept a quotation and we confirm it.
        </p>

        <h2>Pricing</h2>
        <p>
          Quotations are prepared individually based on the details you
          provide. If the actual move differs materially from what was
          described, the price may need to be revised.
        </p>

        <h2>Our service terms</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>{settings.termsText}</p>

        <h2>Contact</h2>
        <p>{settings.contactEmail}</p>
      </div>
    </main>
  );
}
