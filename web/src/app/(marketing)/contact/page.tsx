import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Icon from "@/components/Icon";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Care4Removals team — email us, call the Leeds or Birmingham office, or send a message and we'll come back to you.",
};

const CONTACTS = [
  {
    icon: "mail" as const,
    label: "Email us",
    value: "m.tayyabi2822@gmail.com",
    sub: null,
    href: "mailto:m.tayyabi2822@gmail.com",
  },
  {
    icon: "phone" as const,
    label: "Call Leeds",
    value: "0113 248 8181",
    sub: "188a Roundhay Road, Leeds LS8 5PL",
    href: "tel:01132488181",
  },
  {
    icon: "phone" as const,
    label: "Call Birmingham",
    value: "0121 726 8542",
    sub: "9 Sheaf Lane, Coventry Road, Birmingham B26 3EJ",
    href: "tel:01217268542",
  },
];

const NEXT = [
  {
    icon: "file" as const,
    title: "Tell us what you need",
    body: "Share the basics of your move and any questions.",
  },
  {
    icon: "message" as const,
    title: "We work through the details",
    body: "We can clarify services, timing and practical requirements.",
  },
  {
    icon: "truck" as const,
    title: "Move forward confidently",
    body: "When you're ready, request your quote and take the next step.",
  },
];

export default function ContactPage() {
  return (
    <main className="svc ctp">
      {/* ---------- HERO ---------- */}
      <section className="svc-hero">
        <div className="container svc-hero-grid">
          <div className="svc-hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              Get in touch
            </div>
            <h1>
              Let&apos;s talk about
              <br />
              <span>your move.</span>
            </h1>
            <p>
              Have a question, need help with a removal or ready to request a
              quote? Get in touch with the Care4Removals team.
            </p>
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

      {/* ---------- INFO + FORM ---------- */}
      <section className="section ctp-section">
        <div className="container ctp-grid">
          <div className="ctp-info">
            <h2>We&apos;re here to make moving easier.</h2>
            <div className="ctp-cards">
              {CONTACTS.map((c) => (
                <a key={c.label} href={c.href} className="ctp-card">
                  <span className="ctp-card-ic">
                    <Icon name={c.icon} size={20} />
                  </span>
                  <span className="ctp-card-body">
                    <strong>{c.label}</strong>
                    <span className="ctp-card-value">{c.value}</span>
                    {c.sub && <span className="ctp-card-sub">{c.sub}</span>}
                  </span>
                  <Icon name="arrow-right" size={18} className="ctp-card-go" />
                </a>
              ))}
            </div>
          </div>

          <div className="ctp-form-card">
            <h2>Send us a message</h2>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* ---------- WHAT HAPPENS NEXT ---------- */}
      <section className="section ctp-next-section">
        <div className="container">
          <div className="section-heading centered">
            <h2>What happens next</h2>
          </div>
          <ol className="ctp-steps">
            {NEXT.map((s, i) => (
              <li key={s.title} className="ctp-step">
                <span className="ctp-step-ic">
                  <Icon name={s.icon} size={24} />
                </span>
                <div className="ctp-step-copy">
                  <span className="ctp-step-no">{`0${i + 1}`}</span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
                {i < NEXT.length - 1 && (
                  <span className="ctp-step-arrow" aria-hidden="true">
                    <Icon name="arrow-right" size={20} />
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="section ctp-cta-section">
        <div className="container">
          <div className="ctp-cta-card">
            <div className="ctp-cta-art">
              <Image
                src="/assets/why-transparent.png"
                alt=""
                width={640}
                height={557}
                sizes="(max-width: 700px) 40vw, 180px"
              />
            </div>
            <div className="ctp-cta-copy">
              <div className="eyebrow eyebrow-light">
                <span className="eyebrow-dot" />
                Planning a move?
              </div>
              <h2>
                Get your free <span>removal quote.</span>
              </h2>
              <p>
                If you&apos;re ready to move, send us your property and moving
                details through the quote form.
              </p>
            </div>
            <Link href="/get-a-quote" className="btn btn-white">
              Get a free quote
              <Icon name="arrow-right" size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
