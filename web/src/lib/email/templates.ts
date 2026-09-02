import { formatPence } from "@/lib/quote/calc";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const wrap = (bodyHtml: string) => `<!doctype html>
<html><body style="margin:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;color:#0b1a30">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
<tr><td style="background:#0b1a30;padding:20px 28px;color:#fff;font-size:18px;font-weight:bold">
care4<span style="color:#37c4e0">removals</span></td></tr>
<tr><td style="padding:28px">${bodyHtml}</td></tr>
<tr><td style="padding:16px 28px;background:#f0f3f7;font-size:12px;color:#7f93ad">
This email was sent by Care4Removals regarding your removal enquiry.</td></tr>
</table></td></tr></table></body></html>`;

// ---- new-lead staff notification ----
export function leadNotification(opts: {
  customerName: string;
  source: string;
  summary: string;
  adminUrl: string;
}) {
  const text = `New ${opts.source} enquiry from ${opts.customerName}

${opts.summary}

Open in the staff portal: ${opts.adminUrl}`;

  const html = wrap(`
    <h2 style="margin:0 0 12px;font-size:17px">New ${esc(opts.source)} enquiry</h2>
    <p style="margin:0 0 8px"><strong>${esc(opts.customerName)}</strong></p>
    <p style="margin:0 0 16px;white-space:pre-wrap;color:#33465f">${esc(opts.summary)}</p>
    <p style="margin:0"><a href="${esc(opts.adminUrl)}" style="background:#ff6b4a;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;display:inline-block">Open in staff portal</a></p>
  `);

  return { subject: `New enquiry — ${opts.customerName}`, html, text };
}

// ---- customer enquiry acknowledgement ----
export function enquiryAcknowledgement(opts: {
  customerName: string;
  reference: string;
}) {
  const text = `Hi ${opts.customerName},

Thanks for your enquiry with Care4Removals. We've received it and a member of the team will be in touch shortly.

Your reference: ${opts.reference}

Care4Removals`;

  const html = wrap(`
    <h2 style="margin:0 0 12px;font-size:17px">Thanks — we've got your enquiry</h2>
    <p style="margin:0 0 12px">Hi ${esc(opts.customerName)},</p>
    <p style="margin:0 0 12px;color:#33465f">We've received your enquiry and a member of the team will be in touch shortly.</p>
    <p style="margin:0;color:#33465f">Your reference: <strong>${esc(opts.reference)}</strong></p>
  `);

  return {
    subject: "We've received your enquiry — Care4Removals",
    html,
    text,
  };
}

// ---- quotation email ----
export function quotationEmail(opts: {
  customerName: string;
  quoteNumber: string;
  total: number;
  expiresAt: string;
  secureUrl: string;
}) {
  const text = `Hi ${opts.customerName},

Your removal quotation ${opts.quoteNumber} is ready.

Total: ${formatPence(opts.total)}
Valid until: ${opts.expiresAt}

View, download and respond to your quotation securely here:
${opts.secureUrl}

Care4Removals`;

  const html = wrap(`
    <h2 style="margin:0 0 12px;font-size:17px">Your quotation is ready</h2>
    <p style="margin:0 0 12px">Hi ${esc(opts.customerName)},</p>
    <p style="margin:0 0 6px;color:#33465f">Quotation <strong>${esc(opts.quoteNumber)}</strong></p>
    <p style="margin:0 0 6px;color:#33465f">Total: <strong>${formatPence(opts.total)}</strong></p>
    <p style="margin:0 0 16px;color:#33465f">Valid until ${esc(opts.expiresAt)}</p>
    <p style="margin:0 0 16px"><a href="${esc(opts.secureUrl)}" style="background:#ff6b4a;color:#fff;text-decoration:none;padding:11px 20px;border-radius:8px;display:inline-block">View &amp; respond to your quote</a></p>
    <p style="margin:0;font-size:12px;color:#7f93ad">A PDF copy is attached. This link is private to you — please don't forward it.</p>
  `);

  return {
    subject: `Your Care4Removals quotation ${opts.quoteNumber}`,
    html,
    text,
  };
}
