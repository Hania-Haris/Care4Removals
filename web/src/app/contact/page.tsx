import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Care4Removals team to discuss your upcoming move.",
};

export default function ContactPageStatic() {
  return (
    <>


<main>

<section className="contact-hero">
    <div className="container">
        <div className="contact-hero-inner">
            <div className="eyebrow">
                <span className="eyebrow-dot"></span>
                Get in touch
            </div>
            <h1>Let&apos;s talk about<br /><span>your move.</span></h1>
            <p>
                Have a question, need help with a removal or ready to request
                a quote? Get in touch with the Care4Removals team.
            </p>
        </div>
    </div>
</section>

<section className="contact-section">
    <div className="container contact-grid">

        <div className="contact-info">
            <div className="eyebrow">
                <span className="eyebrow-dot"></span>
                Contact the team
            </div>

            <h2>We&apos;re here to make moving <span>easier.</span></h2>

            <p>
                Contact the relevant office directly, email the team, or use
                the form on this page. For a full removal enquiry, our free
                quote form is the quickest way to send your move details.
            </p>

            <div className="office-card">
                <h3>Leeds</h3>
                <p>188a Roundhay Road<br />Leeds<br />LS8 5PL</p>
                <a href="tel:01132488181">0113 248 8181</a>
            </div>

            <div className="office-card">
                <h3>Birmingham</h3>
                <p>9 Sheaf Lane<br />Coventry Road<br />Birmingham<br />B26 3EJ</p>
                <a href="tel:01217268542">0121 726 8542</a>
            </div>

            <div className="contact-methods">
                <div className="contact-method">
                    <span className="contact-method-icon">✉</span>
                    <a href="mailto:m.tayyabi2822@gmail.com" style={{ color: "inherit", textDecoration: "none" }}>m.tayyabi2822@gmail.com</a>
                </div>
                <div className="contact-method">
                    <span className="contact-method-icon">→</span>
                    <span>Free removal quotes available online</span>
                </div>
            </div>
        </div>

        <div className="contact-form-card">
            <h2>Send us a message</h2>
            <p>
                Fill in the form below and tell us how we can help.
            </p>

            <form id="contactForm">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="name">Name <span className="required">*</span></label>
                        <input id="name" name="name" type="text" autoComplete="name" required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone <span className="required">*</span></label>
                        <input id="phone" name="phone" type="tel" autoComplete="tel" required />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email <span className="required">*</span></label>
                    <input id="email" name="email" type="email" autoComplete="email" required />
                </div>

                <div className="form-group">
                    <label htmlFor="subject">What can we help with?</label>
                    <select id="subject" name="subject">
                        <option value="General enquiry">General enquiry</option>
                        <option value="Removal enquiry">Removal enquiry</option>
                        <option value="Existing booking">Existing booking</option>
                        <option value="Quote question">Quote question</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="message">Message <span className="required">*</span></label>
                    <textarea id="message" name="message" required placeholder="Tell us how we can help..."></textarea>
                </div>

                <p className="form-note">
                    By submitting this form, you are sending your enquiry to
                    Care4Removals for review.
                </p>

                <button type="submit" className="btn btn-primary">
                    Send Message <span>→</span>
                </button>

                <div id="formStatus" className="form-status"></div>
            </form>
        </div>

    </div>
</section>


<section className="contact-experience" data-reveal>
  <div className="container"><div className="contact-experience-head"><div><span className="eyebrow">What happens next</span><h2>Simple from the <span>first message.</span></h2></div><p>Whether you are still planning or ready to move, you can start with a quick conversation.</p></div><div className="contact-steps"><div><span>01</span><strong>Tell us what you need</strong><p>Share the basics of your move and any questions.</p></div><div><span>02</span><strong>We work through the details</strong><p>We can clarify services, timing and practical requirements.</p></div><div><span>03</span><strong>Move forward confidently</strong><p>When you are ready, request your quote and take the next step.</p></div></div></div>
</section>

<section className="cta-section">
    <div className="container">
        <div className="cta-card">
            <div>
                <div className="eyebrow">
                    <span className="eyebrow-dot"></span>
                    Planning a move?
                </div>
                <h2>Get your free <span>removal quote.</span></h2>
                <p>
                    If you&apos;re ready to move, send us your property and moving
                    details through the quote form.
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
