import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQs",
  description:
    "Answers to common questions about Care4Removals' service, pricing, insurance and moving process.",
};

export default function FaqsPage() {
  return (
    <>


<main>

<section className="faq-hero">
    <div className="container">
        <div className="faq-hero-inner">
            <div className="eyebrow">
                <span className="eyebrow-dot"></span>
                Frequently asked questions
            </div>

            <h1>Questions? We&apos;ve got<br /><span>you covered.</span></h1>

            <p>
                Find answers to some common questions about requesting a quote
                and arranging your removal. If you can&apos;t find what you&apos;re
                looking for, our team is happy to help.
            </p>
        </div>
    </div>
</section>

<section className="faq-section">
    <div className="container faq-layout">

        <div className="faq-intro">
            <div className="eyebrow">
                <span className="eyebrow-dot"></span>
                Need a hand?
            </div>

            <h2>Still not sure? <span>Ask us.</span></h2>

            <p>
                Every move is different. If your question isn&apos;t answered here,
                get in touch with the team or send us your move details through
                the quote form.
            </p>

            <div className="faq-intro-box">
                <strong>Ready to move?</strong>
                <span>
                    Start with a free quote and tell us about your current and
                    new property.
                </span>
            </div>

            <a href="/get-a-quote" className="btn btn-primary" style={{ marginTop: "18px" }}>
                Get a Free Quote <span>→</span>
            </a>
        </div>

        <div className="faq-list">

            <details className="faq-item">
                <summary className="faq-question">
                    <span>How do I request a removal quote?</span>
                    <span className="faq-toggle" aria-hidden="true"></span>
                </summary>
                <div className="faq-answer">
                    <p>
                        Use our online quote form and provide your contact
                        details, current property, new property, preferred
                        moving date and any special instructions. The team can
                        then review your enquiry and get back to you.
                    </p>
                </div>
            </details>

            <details className="faq-item">
                <summary className="faq-question">
                    <span>What information do I need to provide?</span>
                    <span className="faq-toggle" aria-hidden="true"></span>
                </summary>
                <div className="faq-answer">
                    <p>
                        You&apos;ll be asked for your name, email address and phone
                        number, along with details about the property you&apos;re
                        moving from, the property you&apos;re moving to and your
                        preferred moving date. You can also add special
                        instructions.
                    </p>
                </div>
            </details>

            <details className="faq-item">
                <summary className="faq-question">
                    <span>Can you help with a full-house move?</span>
                    <span className="faq-toggle" aria-hidden="true"></span>
                </summary>
                <div className="faq-answer">
                    <p>
                        Yes. The removal service is intended to support moves
                        ranging from heavy furniture through to full-house
                        relocations. The details of your move can be discussed
                        as part of the quote process.
                    </p>
                </div>
            </details>

            <details className="faq-item">
                <summary className="faq-question">
                    <span>Can you help with packing?</span>
                    <span className="faq-toggle" aria-hidden="true"></span>
                </summary>
                <div className="faq-answer">
                    <p>
                        Careful packing is part of the removal service. Include
                        your requirements in the quote enquiry so the team can
                        understand what help you need.
                    </p>
                </div>
            </details>

            <details className="faq-item">
                <summary className="faq-question">
                    <span>How does the removal process work?</span>
                    <span className="faq-toggle" aria-hidden="true"></span>
                </summary>
                <div className="faq-answer">
                    <p>
                        The process is straightforward: request a quote, work
                        with the team to plan the move, and then have your
                        belongings transported and delivered to your new
                        property.
                    </p>
                </div>
            </details>

            <details className="faq-item">
                <summary className="faq-question">
                    <span>How do I contact the team?</span>
                    <span className="faq-toggle" aria-hidden="true"></span>
                </summary>
                <div className="faq-answer">
                    <p>
                        You can use our Contact page to find the Leeds and
                        Birmingham office details, call the relevant office,
                        email the company, or submit a free quote enquiry online.
                    </p>
                </div>
            </details>

            <details className="faq-item">
                <summary className="faq-question">
                    <span>What happens after I submit my enquiry?</span>
                    <span className="faq-toggle" aria-hidden="true"></span>
                </summary>
                <div className="faq-answer">
                    <p>
                        Your enquiry is submitted to the removal system for the
                        team to review. A member of the team can then contact
                        you regarding your move and quote.
                    </p>
                </div>
            </details>

        </div>
    </div>
</section>

<section className="faq-cta">
    <div className="container">
        <div className="faq-cta-card">
            <div>
                <div className="eyebrow">
                    <span className="eyebrow-dot"></span>
                    Let&apos;s get moving
                </div>

                <h2>Have a move in mind? <span>Let&apos;s talk.</span></h2>

                <p>
                    Give us the details of your move and request a free,
                    personalised quote.
                </p>
            </div>

            <a href="/get-a-quote" className="btn btn-white">
                Request a Free Quote <span>→</span>
            </a>
        </div>
    </div>
</section>

</main>

    </>
  );
}
