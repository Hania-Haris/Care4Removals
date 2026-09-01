import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Care4Removals collects, uses and protects the personal information you provide.",
};

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const settings = await getSettings();
  return (
    <main className="legal-page">
      <div className="container">
        <p className="legal-draft">
          Draft — this policy is being finalised with legal review before
          launch (Phase 10). It describes the intended handling of your data.
        </p>
        <h1>Privacy Policy</h1>

        <h2>Who we are</h2>
        <p>
          This site is operated by {settings.legalEntityName}. You can contact
          us at {settings.contactEmail}.
        </p>

        <h2>What we collect</h2>
        <p>
          When you submit an enquiry or quote request we collect the details
          you provide: your name, contact details, the addresses involved in
          your move, your preferred dates, and any notes you add. Staff may add
          internal notes about your enquiry.
        </p>

        <h2>How we use it</h2>
        <p>
          We use this information to respond to your enquiry, prepare and send
          a quotation, and — if you go ahead — to carry out your removal. We do
          not sell your information or use it for unrelated marketing.
        </p>

        <h2>How long we keep it</h2>
        <p>
          Enquiries, quotes and related records are retained for 24 months,
          after which they are archived or deleted.
        </p>

        <h2>Your rights</h2>
        <p>
          You can ask us for a copy of the information we hold about you, ask
          us to correct it, or ask us to delete it. Contact{" "}
          {settings.contactEmail}.
        </p>

        <h2>Cookies</h2>
        <p>
          See our <a href="/legal/cookies">Cookie Policy</a>.
        </p>
      </div>
    </main>
  );
}
