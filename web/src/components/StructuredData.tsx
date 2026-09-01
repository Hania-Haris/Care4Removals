import { DEFAULT_SETTINGS } from "@/lib/settings";
import { getBaseUrl } from "@/lib/urls";

// Emits MovingCompany JSON-LD — no invented ratings, review counts, or
// unconfirmed claims. Uses DEFAULT_SETTINGS (sync) so the marketing pages
// stay static; the admin-editable values here are low-churn identity fields.
// If they change, a redeploy refreshes this.
export default function StructuredData() {
  const s = DEFAULT_SETTINGS;
  const base = getBaseUrl();

  const data = {
    "@context": "https://schema.org",
    "@type": "MovingCompany",
    name: "Care4Removals",
    legalName: s.legalEntityName,
    url: base,
    email: s.contactEmail,
    ...(s.contactPhone ? { telephone: s.contactPhone } : {}),
    ...(s.coverageAreaText ? { areaServed: s.coverageAreaText } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
