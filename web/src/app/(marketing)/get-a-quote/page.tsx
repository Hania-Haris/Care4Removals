import type { Metadata } from "next";
import QuoteWizard from "@/components/QuoteWizard";

export const metadata: Metadata = {
  title: "Get a Free Quote",
  description:
    "Tell us about your move and request a free, no-obligation removal quote from Care4Removals.",
};

export default function GetAQuotePage() {
  return (
    <main className="quote-page">
      <div className="quote-page-inner">
        <QuoteWizard />
      </div>
    </main>
  );
}
