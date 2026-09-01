import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Care4Removals is part of the Care4Properties journey — reliable, careful removal support for your move.",
};

export default function AboutPage() {
  return (
    <>


<main>

<section className="about-hero">
    <div className="container">
        <div className="about-hero-inner">
            <div className="eyebrow">
                <span className="eyebrow-dot"></span>
                About Care4Removals
            </div>

            <h1>More than a move.<br /><span>It&apos;s your next step.</span></h1>

            <p>
                Care4Removals is part of the Care4Properties property journey,
                providing removal support when it&apos;s time to move from one
                property to another.
            </p>
        </div>
    </div>
</section>

<section className="about-section">
    <div className="container about-grid">
        <div>
            <div className="eyebrow">
                <span className="eyebrow-dot"></span>
                Who we are
            </div>

            <h2>Property support that continues <span>when you move.</span></h2>

            <p>
                Care4Properties supports customers across different stages of
                the property journey. Care4Removals extends that support to the
                practical part of moving between properties.
            </p>

            <p>
                Our focus is simple: make the removal process easier to
                understand, easier to arrange and less stressful for the
                customer.
            </p>

            <p>
                From the first quote request through to delivery, the aim is to
                provide a straightforward service built around your move.
            </p>
        </div>

        <div className="brand-panel">
            <div className="about-visual">
                <span className="about-visual-kicker">MOVING SUPPORT</span>
                <div className="about-visual-brand">care4<span>removals</span></div>
                <div className="about-visual-line"></div>
                <p>Simple, careful and straightforward support from quote to delivery.</p>
            </div>
        </div>
    </div>
</section>


<section className="about-story-band" data-reveal>
  <div className="container about-story-grid"><div className="story-visual" aria-hidden="true"><div className="story-circle"></div><div className="story-card story-card-main"><span>CARE4REMOVALS</span><strong>Moving with care</strong><small>People first. Homes respected.</small></div><div className="story-chip">01 → 02 → 03</div></div><div><span className="eyebrow">More than moving boxes</span><h2>We make the <span>moving day</span> feel manageable.</h2><p>Moving can involve dozens of small decisions. Our role is to bring structure to the process, handle belongings carefully and keep communication simple.</p><p>That means thoughtful preparation, dependable transport and a team that understands that every home is different.</p><div className="about-promise"><div><strong>Care</strong><span>Respect for your belongings and your space.</span></div><div><strong>Clarity</strong><span>Simple communication from start to finish.</span></div><div><strong>Consistency</strong><span>A dependable process you can follow.</span></div></div></div></div>
</section>

<section className="values-section">
    <div className="container">
        <div className="values-heading">
            <div className="eyebrow">
                <span className="eyebrow-dot"></span>
                Our approach
            </div>

            <h2>What matters on <span>moving day.</span></h2>

            <p>
                Moving involves enough decisions already. Our service is
                designed around the things that matter most during a move.
            </p>
        </div>

        <div className="values-grid">
            <article className="value-card">
                <div className="value-icon">♡</div>
                <h3>Care</h3>
                <p>
                    Your belongings are an important part of your move.
                    Careful handling is central to the service from collection
                    through delivery.
                </p>
            </article>

            <article className="value-card">
                <div className="value-icon">✓</div>
                <h3>Clarity</h3>
                <p>
                    We keep the enquiry and quote process straightforward so
                    you can provide the information the team needs without
                    unnecessary complication.
                </p>
            </article>

            <article className="value-card">
                <div className="value-icon">→</div>
                <h3>Reliability</h3>
                <p>
                    A move depends on things coming together at the right time.
                    Our service is focused on dependable transport and delivery.
                </p>
            </article>
        </div>
    </div>
</section>

<section className="journey-section">
    <div className="container journey-layout">
        <div className="journey-heading">
            <div className="eyebrow">
                <span className="eyebrow-dot"></span>
                Your removal journey
            </div>

            <h2>Simple from start to <span>finish.</span></h2>

            <p>
                The removal process is designed to keep things clear at every stage.
            </p>
        </div>

        <div className="journey-steps">
            <div className="journey-step">
                <div className="journey-number">01</div>
                <h3>Request a Quote</h3>
                <p>
                    Tell us about your current property, new property and
                    preferred moving date.
                </p>
            </div>

            <div className="journey-step">
                <div className="journey-number">02</div>
                <h3>Plan & Move</h3>
                <p>
                    Once your move is confirmed, the removal service takes care
                    of the practical work.
                </p>
            </div>

            <div className="journey-step">
                <div className="journey-number">03</div>
                <h3>Settle In</h3>
                <p>
                    Your belongings are delivered to your new property so you
                    can get on with settling into your new space.
                </p>
            </div>
        </div>
    </div>
</section>

<section className="about-cta">
    <div className="container">
        <div className="about-cta-card">
            <div>
                <div className="eyebrow">
                    <span className="eyebrow-dot"></span>
                    Start your move
                </div>

                <h2>Ready to make moving <span>easier?</span></h2>

                <p>
                    Tell us about your move and request a free quote from the
                    Care4Removals team.
                </p>
            </div>

            <a href="/get-a-quote" className="btn btn-white">
                Get a Free Quote <span>→</span>
            </a>
        </div>
    </div>
</section>

</main>

    </>
  );
}
