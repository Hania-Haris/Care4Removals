import Link from "next/link";

// NOTE: contact details below are carried over from the current live site
// unverified (see DECISIONS_REQUIRED.md #3). They will move to the
// admin-editable `settings` collection in Phase 3/5 — not hardcoded long-term.
// The "Team access / Admin Login" link that used to live here has been
// deliberately removed per Phase 5 of the implementation brief.

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="removals-footer-logo">
              care4<span>removals</span>
            </Link>
            <p>Reliable removal services from the Care4Properties team.</p>
            <Link href="/get-a-quote" className="footer-quote-link">
              Get a Free Quote →
            </Link>
          </div>

          <div className="footer-column">
            <h4>Explore</h4>
            <Link href="/services">Services</Link>
            <Link href="/about">About</Link>
            <Link href="/faqs">FAQs</Link>
            <Link href="/contact">Contact</Link>
          </div>

          <div className="footer-column">
            <h4>Leeds</h4>
            <p>
              188a Roundhay Road
              <br />
              Leeds
              <br />
              LS8 5PL
            </p>
            <a href="tel:01132488181">0113 248 8181</a>
          </div>

          <div className="footer-column">
            <h4>Birmingham</h4>
            <p>
              9 Sheaf Lane
              <br />
              Coventry Road
              <br />
              Birmingham
              <br />
              B26 3EJ
            </p>
            <a href="tel:01217268542">0121 726 8542</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Care4Removals</span>
          <a href="mailto:m.tayyabi2822@gmail.com">
            m.tayyabi2822@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
