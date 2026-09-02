import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Icon from "@/components/Icon";

export const metadata: Metadata = {
  title: "Removal Services",
  description:
    "Explore Care4Removals' removal services — careful packing, reliable transport and safe delivery, with clear pricing and one team from first enquiry to move day.",
};

const BENEFITS = [
  {
    icon: "calendar" as const,
    title: "Planned around you",
    body: "We work to your schedule for a smooth, stress-free move.",
  },
  {
    icon: "shield-check" as const,
    title: "Careful handling",
    body: "Your belongings are packed and moved with real care.",
  },
  {
    icon: "message" as const,
    title: "Clear communication",
    body: "We keep you informed at every step of the way.",
  },
];

const SERVICES = [
  {
    img: "/assets/svc-house.png",
    title: "House removals",
    body: "We move homes of all sizes with care and efficiency.",
  },
  {
    img: "/assets/svc-packing.png",
    title: "Careful packing",
    body: "We use quality materials and proven packing methods.",
  },
  {
    img: "/assets/svc-transport.png",
    title: "Reliable transport",
    body: "Our modern vehicles keep your items safe on the road.",
  },
  {
    img: "/assets/svc-delivery.png",
    title: "Safe delivery",
    body: "We deliver on time and place everything with care.",
  },
  {
    img: "/assets/why-transparent.png",
    title: "Clear pricing",
    body: "Transparent quotes with no hidden fees or surprises.",
  },
  {
    img: "/assets/svc-care.png",
    title: "Handled with care",
    body: "Your belongings are treated like our own, every time.",
  },
];

const STEPS = [
  {
    img: "/assets/svc-calendar.png",
    title: "Tell us about your move",
    body: "Share your details and requirements. We'll listen and understand your needs.",
  },
  {
    img: "/assets/svc-transport.png",
    title: "We plan and move",
    body: "We plan everything and handle the packing, loading and transport.",
  },
  {
    img: "/assets/svc-house.png",
    title: "Settle in comfortably",
    body: "We unload and place your items so you can enjoy your new space.",
  },
];

export default function ServicesPage() {
  return (
    <main className="svc">
      {/* ---------- HERO ---------- */}
      <section className="svc-hero">
        <div className="container svc-hero-grid">
          <div className="svc-hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              Our removal service
            </div>
            <h1>
              Moving made <span>simple.</span>
            </h1>
            <p>
              From heavy furniture to full-house relocations, our removal service
              is designed to make moving easier — careful packing, reliable
              transport and safe delivery, handled by one team.
            </p>
            <div className="svc-hero-actions">
              <Link href="/get-a-quote" className="btn btn-primary">
                Get a free quote
                <Icon name="arrow-right" size={18} />
              </Link>
              <Link href="/contact" className="btn btn-secondary">
                Contact the team
              </Link>
            </div>
          </div>

          <div className="svc-hero-art">
            <Image
              src="/assets/svc-hero.png"
              alt="A removal truck outside two houses with packed boxes"
              width={1000}
              height={490}
              priority
              sizes="(max-width: 900px) 90vw, 520px"
            />
          </div>
        </div>
      </section>

      {/* ---------- BENEFITS BAND ---------- */}
      <section className="svc-benefits">
        <div className="container svc-benefits-grid">
          {BENEFITS.map((b) => (
            <div key={b.title} className="svc-benefit">
              <span className="svc-benefit-icon">
                <Icon name={b.icon} size={22} />
              </span>
              <div>
                <h3>{b.title}</h3>
                <p>{b.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- SERVICES GRID ---------- */}
      <section className="section svc-list-section">
        <div className="container">
          <div className="section-heading centered">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              What we do
            </div>
            <h2>Complete moving support, every step of the way.</h2>
            <p>
              Pick the services that fit your move, or let us take care of the
              whole thing from packing to the last box in your new home.
            </p>
          </div>

          <ul className="svc-grid">
            {SERVICES.map((s) => (
              <li key={s.title} className="svc-card">
                <div className="svc-card-art">
                  <Image
                    src={s.img}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 90vw, (max-width: 1000px) 44vw, 360px"
                  />
                </div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- PROCESS ---------- */}
      <section className="section svc-process-section">
        <div className="container">
          <div className="section-heading centered">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              A simple process
            </div>
            <h2>From your current home to your new one.</h2>
            <p>Three clear stages, so you always know what happens next.</p>
          </div>

          <ol className="svc-steps">
            {STEPS.map((s, i) => (
              <li key={s.title} className="svc-step">
                <div className="svc-step-head">
                  <span className="svc-step-no">{`0${i + 1}`}</span>
                  <h3>{s.title}</h3>
                </div>
                <div className="svc-step-art">
                  <Image
                    src={s.img}
                    alt=""
                    fill
                    sizes="(max-width: 900px) 80vw, 320px"
                  />
                </div>
                <p>{s.body}</p>
                {i < STEPS.length - 1 && (
                  <span className="svc-step-arrow" aria-hidden="true">
                    <Icon name="arrow-right" size={22} />
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- SPECIFIC NEEDS BAND ---------- */}
      <section className="svc-note-band">
        <div className="container svc-note-inner">
          <div>
            <div className="eyebrow eyebrow-light">
              <span className="eyebrow-dot" />
              Need something specific?
            </div>
            <h2>Tell us what your move looks like.</h2>
            <p>
              We can help you tailor packing, dismantling, storage and other
              add-on services around the move you actually have.
            </p>
          </div>
          <Link href="/get-a-quote" className="btn btn-primary">
            Build my quote
            <Icon name="arrow-right" size={18} />
          </Link>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="section svc-cta-section">
        <div className="container">
          <div className="svc-cta-card">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-dot" />
                Ready to get started?
              </div>
              <h2>
                Let&apos;s make your <span>move easier.</span>
              </h2>
              <p>
                Tell us about your move and we&apos;ll get back to you with a
                clear, personalised quote.
              </p>
              <Link href="/get-a-quote" className="btn btn-primary">
                Request a free quote
                <Icon name="arrow-right" size={18} />
              </Link>
            </div>
            <div className="svc-cta-art">
              <Image
                src="/assets/svc-delivery.png"
                alt=""
                width={1000}
                height={587}
                sizes="(max-width: 900px) 80vw, 420px"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
