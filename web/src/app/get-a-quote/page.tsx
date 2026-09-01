import type { Metadata } from "next";
import QuoteForm from "@/components/QuoteForm";

export const metadata: Metadata = {
  title: "Get a Free Quote",
  description:
    "Tell us about your move and request a free, no-obligation removal quote from Care4Removals.",
};

export default function GetAQuotePage() {
  return (
    <>
      <main>
        <section className="quote-page">
          <div className="container">
            <div className="quote-intro">
              <div className="eyebrow">
                <span className="eyebrow-dot"></span>
                Get started
              </div>

              <h1>
                Tell us about
                <span>your move.</span>
              </h1>

              <p>
                Give us a few details about your move and our team can get
                back to you with a quote.
              </p>
            </div>

            <div className="quote-form-wrapper">
              <QuoteForm />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
