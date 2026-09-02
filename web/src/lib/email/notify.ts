import "server-only";
import { getSettings } from "@/lib/settings";
import { sendTransactionalEmail } from "./send";
import { leadNotification, enquiryAcknowledgement } from "./templates";
import { adminLeadUrl } from "@/lib/urls";

/**
 * Fire-and-forget notifications for a new lead. Never throws — email is
 * best-effort and must not fail a form submission. Called after the lead
 * doc + activity are written.
 */
export async function notifyNewLead(opts: {
  leadId: string;
  customerName: string;
  customerEmail: string;
  source: "quote-form" | "contact-form";
  summary: string;
  reference: string;
}): Promise<void> {
  try {
    const settings = await getSettings();

    const staffTpl = leadNotification({
      customerName: opts.customerName,
      source: opts.source === "quote-form" ? "quote request" : "contact",
      summary: opts.summary,
      adminUrl: adminLeadUrl(opts.leadId),
    });
    await sendTransactionalEmail({
      to: settings.emailRecipientAddress,
      from: settings.emailSenderAddress,
      subject: staffTpl.subject,
      html: staffTpl.html,
      text: staffTpl.text,
      entityType: "lead",
      entityId: opts.leadId,
      templateType: "lead-notification",
    });

    if (opts.customerEmail) {
      const custTpl = enquiryAcknowledgement({
        customerName: opts.customerName || "there",
        reference: opts.reference,
      });
      await sendTransactionalEmail({
        to: opts.customerEmail,
        from: settings.emailSenderAddress,
        subject: custTpl.subject,
        html: custTpl.html,
        text: custTpl.text,
        entityType: "lead",
        entityId: opts.leadId,
        templateType: "enquiry-acknowledgement",
      });
    }
  } catch (e) {
    console.error("notifyNewLead failed (non-blocking):", e);
  }
}
