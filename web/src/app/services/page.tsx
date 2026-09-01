import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Removal Services",
  description:
    "Explore Care4Removals' removal services — careful packing, reliable transport and safe delivery.",
};

export default function ServicesPage() {
  return (
    <>


<main>

<section className="page-hero">
    <div className="container page-hero-grid">
        <div>
            <div className="eyebrow">
                <span className="eyebrow-dot"></span>
                Our removal service
            </div>

            <h1>Moving made <span>simple.</span></h1>

            <p>
                From heavy furniture to full-house relocations, our removal service
                is designed to make moving easier — with careful packing, reliable
                transport and safe delivery.
            </p>

            <div className="page-hero-actions">
                <a href="/get-a-quote" className="btn btn-primary">Get a Free Quote <span>→</span></a>
                <a href="/contact" className="btn btn-secondary">Contact the Team</a>
            </div>
        </div>

        <div className="services-illustration" aria-hidden="true">
            <div className="illustration-house">
                <div className="house-window"></div>
                <div className="house-door"></div>
            </div>

            <div className="mini-truck">
                <span className="truck-wheel wheel-left"></span>
                <span className="truck-wheel wheel-right"></span>
            </div>
        </div>
    </div>
</section>


<section className="services-highlight" data-reveal>
  <div className="container services-highlight-grid">
    <div><span className="eyebrow">Built around your move</span><h2>Practical help, <span>without the fuss.</span></h2><p>Every service is designed to take a demanding part of moving off your hands. Choose what you need, combine services when it helps, and let the team handle the details.</p><div className="service-tags"><span>Home moves</span><span>Packing support</span><span>Transport</span><span>Safe delivery</span></div></div>
    <div className="service-scene" aria-hidden="true"><div className="scene-sun"></div><div className="scene-home"></div><div className="scene-box box-one"></div><div className="scene-box box-two"></div><div className="scene-truck"><b>C4</b><i></i><i></i></div></div>
  </div>
</section>

<section className="service-detail-section">
    <div className="container">
        <div className="service-detail-heading">
            <div className="eyebrow">
                <span className="eyebrow-dot"></span>
                What we do
            </div>
            <h2>We take care of the <span>hard part.</span></h2>
            <p>
                Our removal service is built around making your move straightforward,
                dependable and less stressful from the first enquiry to delivery.
            </p>
        </div>

        <div className="service-detail-grid">
            <article className="service-detail-card">
                <div className="service-detail-icon">⌂</div>
                <h3>House Removals</h3>
                <p>
                    Whether you&apos;re moving a few large items or relocating your whole
                    home, we can help with the move from one property to another.
                </p>
            </article>

            <article className="service-detail-card">
                <div className="service-detail-icon">□</div>
                <h3>Careful Packing</h3>
                <p>
                    We can help prepare your belongings for the move, keeping the
                    packing process organised and focused on safe handling.
                </p>
            </article>

            <article className="service-detail-card">
                <div className="service-detail-icon">→</div>
                <h3>Reliable Transport</h3>
                <p>
                    Your belongings are transported as part of a planned removal
                    service designed to keep your move running smoothly.
                </p>
            </article>

            <article className="service-detail-card">
                <div className="service-detail-icon">✓</div>
                <h3>Safe Delivery</h3>
                <p>
                    Once your belongings reach their destination, the team helps
                    with delivery and unloading so you can settle in comfortably.
                </p>
            </article>

            <article className="service-detail-card">
                <div className="service-detail-icon">£</div>
                <h3>Clear Pricing</h3>
                <p>
                    Request a quote with your move details and receive clear,
                    upfront pricing with no hidden fees.
                </p>
            </article>

            <article className="service-detail-card">
                <div className="service-detail-icon">♡</div>
                <h3>Handled With Care</h3>
                <p>
                    We treat your belongings with respect throughout the moving
                    process, helping give you peace of mind.
                </p>
            </article>
        </div>
    </div>
</section>

<section className="move-section">
    <div className="container move-grid">
        <div>
            <div className="eyebrow">
                <span className="eyebrow-dot"></span>
                A simpler move
            </div>

            <h2>From your current home to your <span>new one.</span></h2>

            <p>
                Tell us what you are moving, where you&apos;re moving from and where
                you&apos;re going. We&apos;ll use the details you provide to understand
                your requirements and prepare a personalised quote.
            </p>

            <div className="included-list">
                <div className="included-item">
                    <span className="included-check">✓</span>
                    <div><strong>Tell us about your properties.</strong><br />Pickup and delivery details help us understand the move.</div>
                </div>

                <div className="included-item">
                    <span className="included-check">✓</span>
                    <div><strong>Choose your preferred moving date.</strong><br />Give us your preferred date and any special instructions.</div>
                </div>

                <div className="included-item">
                    <span className="included-check">✓</span>
                    <div><strong>Receive a personalised quote.</strong><br />Our team can review your enquiry and get back to you.</div>
                </div>
            </div>
        </div>

        <div className="process-mini">
            <h3>How it works</h3>

            <div className="mini-step">
                <div className="mini-step-number">01</div>
                <div>
                    <h4>Request a Quote</h4>
                    <p>Complete the quick online form with your move details.</p>
                </div>
            </div>

            <div className="mini-step">
                <div className="mini-step-number">02</div>
                <div>
                    <h4>We Plan & Move</h4>
                    <p>Once confirmed, the removal team takes care of the move.</p>
                </div>
            </div>

            <div className="mini-step">
                <div className="mini-step-number">03</div>
                <div>
                    <h4>Settle In Comfortably</h4>
                    <p>Your belongings are delivered and unloaded at your new property.</p>
                </div>
            </div>
        </div>
    </div>
</section>


<section className="services-note-band" data-reveal><div className="container"><div><span className="eyebrow">Need something specific?</span><h3>Tell us what your move looks like.</h3><p>We can help you work out which services make sense for your home, schedule and move size.</p></div><a className="btn btn-primary" href="/get-a-quote">Build My Quote <span>→</span></a></div></section>

<section className="service-cta">
    <div className="container">
        <div className="service-cta-card">
            <div>
                <div className="eyebrow eyebrow-light">
                    <span className="eyebrow-dot"></span>
                    Ready when you are
                </div>

                <h2>Let&apos;s make your <span>move easier.</span></h2>

                <p>
                    Tell us about your move and we&apos;ll get back to you with a
                    clear, personalised quote.
                </p>
            </div>

            <a href="/get-a-quote" className="btn btn-white">Request a Free Quote <span>→</span></a>
        </div>
    </div>
</section>

</main>

    </>
  );
}
