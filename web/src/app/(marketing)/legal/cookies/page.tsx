import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How Care4Removals uses cookies and similar technologies.",
};

export default function CookiesPage() {
  return (
    <main className="legal-page">
      <div className="container">
        <p className="legal-draft">
          Draft — to be finalised alongside analytics/consent configuration
          (Phase 10).
        </p>
        <h1>Cookie Policy</h1>

        <h2>Essential cookies</h2>
        <p>
          We use a small number of strictly necessary cookies so the site and
          the staff portal work — for example, to keep staff signed in. These
          can&apos;t be turned off.
        </p>

        <h2>Analytics</h2>
        <p>
          We do not currently load analytics or advertising cookies. If that
          changes, this page will be updated and you&apos;ll be asked for
          consent first.
        </p>
      </div>
    </main>
  );
}
