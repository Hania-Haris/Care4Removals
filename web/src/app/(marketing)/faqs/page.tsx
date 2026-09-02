import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Icon from "@/components/Icon";
import FaqExplorer from "@/components/FaqExplorer";

export const metadata: Metadata = {
  title: "FAQs",
  description:
    "Quick answers to common questions about Care4Removals — quotes, packing, moving day and life after your move.",
};

export default function FaqsPage() {
  return (
    <main className="svc faqp">
      {/* ---------- HERO ---------- */}
      <section className="svc-hero faqp-hero">
        <div className="container">
          <div className="faqp-hero-inner">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              Frequently asked questions
            </div>
            <h1>
              Questions? We&apos;ve got <span>you covered.</span>
            </h1>
            <p>
              Find quick answers to common questions about quotes, packing,
              moving day and life after your move.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- EXPLORER ---------- */}
      <section className="section faqp-section">
        <div className="container">
          <FaqExplorer />

          <div className="faqp-help">
            <div className="faqp-help-art">
              <Image
                src="/assets/svc-chat.png"
                alt=""
                width={900}
                height={658}
                sizes="(max-width: 700px) 60vw, 220px"
              />
            </div>
            <div className="faqp-help-copy">
              <h2>
                Can&apos;t find your answer? <span>Our team can help.</span>
              </h2>
              <p>
                Get in touch and we&apos;ll answer your question as quickly as
                possible.
              </p>
              <Link href="/contact" className="btn btn-primary">
                Get in touch
                <Icon name="arrow-right" size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="section faqp-cta-section">
        <div className="container">
          <div className="faqp-cta-card">
            <div>
              <div className="eyebrow eyebrow-light">
                <span className="eyebrow-dot" />
                Let&apos;s get moving
              </div>
              <h2>
                Have a move in mind? <span>Let&apos;s talk.</span>
              </h2>
              <p>
                Give us the details of your move and request a free, personalised
                quote.
              </p>
            </div>
            <Link href="/get-a-quote" className="btn btn-white">
              Request a free quote
              <Icon name="arrow-right" size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
