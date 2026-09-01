// Absolute base URL for building links in emails (which can't use relative
// paths). Set NEXT_PUBLIC_SITE_URL in each environment; falls back to
// localhost for dev.
export function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export function customerQuoteUrl(token: string): string {
  return `${getBaseUrl()}/quote/${token}`;
}

export function adminLeadUrl(leadId: string): string {
  return `${getBaseUrl()}/admin/leads/${leadId}`;
}
