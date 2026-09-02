import Link from "next/link";
import Icon from "@/components/Icon";
import Image from "next/image";

const WHY_STEPS = [
  {
    img: "/assets/why-protected.png",
    w: 640,
    h: 620,
    label: "Protected",
    body: "Packed and handled with care.",
  },
  {
    img: "/assets/why-coordinated.png",
    w: 760,
    h: 321,
    label: "Coordinated",
    body: "One team manages the whole move.",
  },
  {
    img: "/assets/why-transparent.png",
    w: 640,
    h: 557,
    label: "Transparent",
    body: "Clear pricing before moving day.",
  },
];

const SERVICES = [
  { icon: "box" as const, title: "House removals", body: "Full-home moves, planned around your date and your access." },
  { icon: "shield-check" as const, title: "Careful packing", body: "Professional materials and methodical packing for fragile and bulky items." },
  { icon: "truck" as const, title: "Reliable transport", body: "The right vehicle for your move, loaded and secured properly." },
  { icon: "home" as const, title: "Safe delivery", body: "Everything placed where you want it in your new home." },
];

const STEPS = [
  {
    icon: "route" as const,
    title: "Request a quote",
    body: "Tell us about your current property, your new property and your preferred date.",
  },
  {
    icon: "truck" as const,
    title: "We plan & move",
    body: "Once you accept your quotation, our team takes care of the packing and transport.",
  },
  {
    icon: "home" as const,
    title: "Settle in",
    body: "Your belongings arrive at your new home so you can get on with settling in.",
  },
];

export default function HomePage() {
  return (
    <main>
      {/* ---------- HERO ---------- */}
      <section className="hero hero--image">
        <Image
          src="/assets/hero-journey.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hero-bg"
        />
        <div className="hero-scrim" />

        <div className="container hero-inner">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              Moving made easier
            </div>

            <h1>
              Your move.
              <br />
              <span>Our care.</span>
            </h1>

            <p className="hero-text">
              Reliable removal services from the team behind Care4Properties —
              from careful packing to safe delivery, we take care of the hard
              work.
            </p>

            <div className="hero-actions">
              <Link href="/get-a-quote" className="btn btn-primary">
                Get a free quote
                <Icon name="arrow-right" size={18} />
              </Link>
              <Link href="/services" className="btn btn-secondary">
                Explore our services
              </Link>
            </div>

            <p className="hero-trust">
              <Icon name="check" size={16} /> Leeds &amp; Birmingham &nbsp;·&nbsp;
              Local office support &nbsp;·&nbsp; Part of Care4Properties
            </p>
          </div>
        </div>
      </section>

      {/* ---------- BENEFITS ---------- */}
      <section className="section why-section">
        <div className="container">
          <div className="section-heading centered">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              Why Care4Removals
            </div>
            <h2>Moving day, without the stress</h2>
            <p>
              We take care of the difficult parts so you can focus on settling
              into your new home.
            </p>
          </div>

          <ol className="why-steps">
            {WHY_STEPS.map((s, i) => (
              <li key={s.label} className="why-step">
                <div className="why-step-art">
                  <Image
                    src={s.img}
                    alt=""
                    width={s.w}
                    height={s.h}
                    sizes="(max-width: 860px) 70vw, 300px"
                  />
                </div>
                <div className="why-step-body">
                  <span className="why-step-no">{i + 1}</span>
                  <h3>{s.label}</h3>
                  <p>{s.body}</p>
                </div>
                {i < WHY_STEPS.length - 1 && (
                  <span className="why-connector" aria-hidden="true">
                    <svg viewBox="0 0 92 34" fill="none">
                      <path
                        d="M3 6 C 22 6, 26 28, 46 28 S 70 6, 89 6"
                        stroke="#3fc0dd"
                        strokeWidth="3"
                        strokeDasharray="1 8"
                        strokeLinecap="round"
                      />
                      <circle cx="46" cy="28" r="6.5" fill="#fff" stroke="#e2660f" strokeWidth="3" />
                    </svg>
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- SERVICES ---------- */}
      <section className="section services-preview">
        <div className="container">
          <div className="section-heading centered">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              What we do
            </div>
            <h2>Everything your move needs</h2>
            <p>
              Choose the services that fit your move — or let us handle all of
              it.
            </p>
          </div>

          <div className="home-services-grid">
            {SERVICES.map((s) => (
              <div key={s.title} className="home-service-item">
                <span className="feature-icon">
                  <Icon name={s.icon} />
                </span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>

          <div className="home-services-cta">
            <Link href="/services" className="btn btn-primary">
              See all services
              <Icon name="arrow-right" size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="section process-section">
        <div className="container">
          <div className="section-heading centered">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              How it works
            </div>
            <h2>Simple from start to finish</h2>
            <p>
              Three clear stages, so you always know what happens next.
            </p>
          </div>

          <div className="process-grid">
            {STEPS.map((step, i) => (
              <article
                key={step.title}
                className={`process-card${i === 1 ? " process-card-active" : ""}`}
              >
                <span className="process-step-no">{`0${i + 1}`}</span>
                <span className="process-icon">
                  <Icon name={step.icon} />
                </span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- ABOUT TEASER ---------- */}
      <section className="section company-section">
        <div className="container company-grid">
          <div>
            <div className="eyebrow eyebrow-light">
              <span className="eyebrow-dot" />
              Backed by Care4Properties
            </div>
            <h2>
              More than a move — <span>part of your property journey</span>
            </h2>
            <p>
              Care4Properties supports customers across the property journey in
              Leeds and Birmingham. Care4Removals extends that support to the
              moving stage, with the same focus on doing things properly.
            </p>
            <Link href="/about" className="btn btn-white">
              Learn about us
              <Icon name="arrow-right" size={18} />
            </Link>
          </div>
          <ul className="company-points">
            <li>
              <Icon name="sparkle" size={20} />
              <span>People first, homes respected</span>
            </li>
            <li>
              <Icon name="clock" size={20} />
              <span>A dependable process you can follow</span>
            </li>
            <li>
              <Icon name="check" size={20} />
              <span>Clear communication start to finish</span>
            </li>
          </ul>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div>
              <div className="eyebrow eyebrow-light">
                <span className="eyebrow-dot" />
                Ready when you are
              </div>
              <h2>
                Let&apos;s make your <span>move easier</span>
              </h2>
              <p>
                Tell us about your move and we&apos;ll get back to you with a
                clear, personalised quote.
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
