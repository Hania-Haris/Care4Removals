import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Icon from "@/components/Icon";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Care4Removals is the moving support service from the Care4Properties team — careful handling, a clear process and reliable transport for your next step.",
};

const APPROACH = [
  {
    img: "/assets/svc-care.png",
    title: "Care",
    body: "Your belongings are handled with care at every stage of the move.",
  },
  {
    img: "/assets/why-transparent.png",
    title: "Clarity",
    body: "We keep the process clear so you always know what happens next.",
  },
  {
    img: "/assets/svc-transport.png",
    title: "Reliability",
    body: "We turn up on time and get the job done properly.",
  },
];

const JOURNEY = [
  {
    img: "/assets/svc-calendar.png",
    title: "Request a quote",
    body: "Tell us about your move and get a clear, no-obligation quote.",
  },
  {
    img: "/assets/svc-transport.png",
    title: "Plan & move",
    body: "We plan the details and take care of your move with care and efficiency.",
  },
  {
    img: "/assets/svc-house.png",
    title: "Settle in",
    body: "We deliver to your new home so you can get on with settling in.",
  },
];

export default function AboutPage() {
  return (
    <main className="svc ab">
      {/* ---------- HERO ---------- */}
      <section className="svc-hero">
        <div className="container svc-hero-grid">
          <div className="svc-hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              About Care4Removals
            </div>
            <h1>
              More than a move.
              <br />
              It&apos;s <span>your next step.</span>
            </h1>
            <p>
              Care4Removals is property support that continues when it&apos;s
              time to move forward — the removals arm of the Care4Properties
              team.
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

      {/* ---------- WHO WE ARE ---------- */}
      <section className="section ab-who-section">
        <div className="container ab-who">
          <div className="ab-who-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              Who we are
            </div>
            <h2>Property support that continues when you move.</h2>
            <p>
              Care4Removals is the moving support service from the
              Care4Properties team. The same people who help customers through
              the property journey now help with the move itself.
            </p>
            <p>
              From organising the packing to safe delivery at the other end,
              we&apos;re here to make your next step simple and stress-free —
              with one team accountable from your first enquiry to the last box.
            </p>
          </div>

          <div className="ab-relate">
            <div className="ab-relate-node">
              <span className="ab-relate-ic ab-relate-ic-navy">
                <Icon name="home" size={26} />
              </span>
              <strong>Care4Properties</strong>
              <span>Property support before you move.</span>
            </div>
            <span className="ab-relate-link" aria-hidden="true">
              <Icon name="arrow-right" size={20} />
            </span>
            <div className="ab-relate-node">
              <span className="ab-relate-ic ab-relate-ic-amber">
                <Icon name="truck" size={26} />
              </span>
              <strong className="ab-relate-brand">
                care4<b>removals</b>
              </strong>
              <span>Moving support when you move.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- OUR APPROACH ---------- */}
      <section className="section ab-approach-section">
        <div className="container">
          <div className="section-heading centered">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              Our approach
            </div>
            <h2>What matters on moving day.</h2>
            <p>
              Moving already involves enough decisions. Our service is built
              around the things that matter most on the day.
            </p>
          </div>

          <ul className="svc-grid ab-approach-grid">
            {APPROACH.map((a) => (
              <li key={a.title} className="svc-card">
                <div className="svc-card-art">
                  <Image
                    src={a.img}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 90vw, 360px"
                  />
                </div>
                <h3>{a.title}</h3>
                <p>{a.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- REMOVAL JOURNEY ---------- */}
      <section className="section svc-process-section ab-journey-section">
        <div className="container">
          <div className="section-heading centered">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              Your removal journey
            </div>
            <h2>Simple from start to finish.</h2>
            <p>Three clear stages, so you always know what happens next.</p>
          </div>

          <ol className="svc-steps">
            {JOURNEY.map((s, i) => (
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
                {i < JOURNEY.length - 1 && (
                  <span className="svc-step-arrow" aria-hidden="true">
                    <Icon name="arrow-right" size={22} />
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="section ab-cta-section">
        <div className="container">
          <div className="ab-cta-card">
            <div>
              <div className="eyebrow eyebrow-light">
                <span className="eyebrow-dot" />
                Start your move
              </div>
              <h2>
                Ready to make moving <span>easier?</span>
              </h2>
              <p>
                Tell us about your move and request a free quote from the
                Care4Removals team.
              </p>
            </div>
            <Link href="/get-a-quote" className="btn btn-primary">
              Get a free quote
              <Icon name="arrow-right" size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
