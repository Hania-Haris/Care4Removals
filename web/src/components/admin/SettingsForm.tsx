"use client";

import { useActionState } from "react";
import {
  updateSettings,
  type SettingsActionResult,
} from "@/app/actions/settings";
import { serviceCatalogToRaw } from "@/lib/validation/settings";
import type { Settings } from "@/lib/settings";

const initial: SettingsActionResult = { ok: false, message: "" };

export default function SettingsForm({
  settings,
  canEdit,
}: {
  settings: Settings;
  canEdit: boolean;
}) {
  const [state, action, pending] = useActionState(updateSettings, initial);
  const err = (f: string) => state.fieldErrors?.[f];

  return (
    <form action={action} className="admin-settings-form">
      {state.message && (
        <div
          className={`admin-inline-msg ${state.ok ? "ok" : "err"}`}
          role="status"
        >
          {state.message}
        </div>
      )}

      {!canEdit && (
        <p className="admin-muted">
          Your role is read-only — these values can only be changed by an
          admin or manager.
        </p>
      )}

      <fieldset disabled={!canEdit || pending}>
        <div className="admin-settings-grid">
          <section className="admin-card">
            <h2>Business identity</h2>

            <label>
              Legal entity name
              <input name="legalEntityName" defaultValue={settings.legalEntityName} />
              {err("legalEntityName") && <span className="field-error">{err("legalEntityName")}</span>}
            </label>

            <label>
              Coverage area (shown on the site)
              <input name="coverageAreaText" defaultValue={settings.coverageAreaText} />
            </label>

            <label>
              Contact email
              <input name="contactEmail" type="email" defaultValue={settings.contactEmail} />
              {err("contactEmail") && <span className="field-error">{err("contactEmail")}</span>}
            </label>

            <label>
              Contact phone
              <input name="contactPhone" defaultValue={settings.contactPhone} />
            </label>

            <label>
              Contact address
              <input name="contactAddress" defaultValue={settings.contactAddress} />
            </label>
          </section>

          <section className="admin-card">
            <h2>Quoting</h2>

            <label>
              VAT treatment
              <select name="vatMode" defaultValue={settings.vatMode}>
                <option value="none">Not applicable (no VAT line)</option>
                <option value="inclusive">Prices include VAT</option>
                <option value="exclusive">Add VAT on top (20%)</option>
              </select>
            </label>

            <label>
              Quote validity (days)
              <input
                name="quoteValidityDays"
                type="number"
                min={1}
                max={365}
                defaultValue={settings.quoteValidityDays}
              />
              {err("quoteValidityDays") && <span className="field-error">{err("quoteValidityDays")}</span>}
            </label>

            <label className="admin-checkbox-row">
              <input
                type="checkbox"
                name="depositEnabled"
                defaultChecked={settings.depositEnabled}
              />
              Collect a deposit before confirming a job
            </label>

            <label className="admin-checkbox-row">
              <input
                type="checkbox"
                name="managerReviewRequired"
                defaultChecked={settings.managerReviewRequired}
              />
              Require manager review before a quote can be sent
            </label>
          </section>

          <section className="admin-card">
            <h2>Email</h2>
            <p className="admin-muted admin-note-hint">
              Sender must be an address on a domain verified in Resend, or the
              Resend sandbox sender. Recipient is where new-enquiry alerts go.
            </p>
            <label>
              Sender address
              <input name="emailSenderAddress" type="email" defaultValue={settings.emailSenderAddress} />
              {err("emailSenderAddress") && <span className="field-error">{err("emailSenderAddress")}</span>}
            </label>
            <label>
              Lead-alert recipient
              <input name="emailRecipientAddress" type="email" defaultValue={settings.emailRecipientAddress} />
              {err("emailRecipientAddress") && <span className="field-error">{err("emailRecipientAddress")}</span>}
            </label>
          </section>

          <section className="admin-card">
            <h2>Service catalog</h2>
            <p className="admin-muted admin-note-hint">
              One service per line. Prefix a line with <code>-</code> to keep
              it in the list but mark it inactive (hidden from the quote form).
            </p>
            <textarea
              name="serviceCatalogRaw"
              rows={6}
              defaultValue={serviceCatalogToRaw(settings.serviceCatalog)}
            />
            {err("serviceCatalogRaw") && <span className="field-error">{err("serviceCatalogRaw")}</span>}
          </section>

          <section className="admin-card admin-card-wide">
            <h2>Terms &amp; conditions text</h2>
            <p className="admin-muted admin-note-hint">
              Shown on the public Terms page and included on quotations.
            </p>
            <textarea
              name="termsText"
              rows={8}
              defaultValue={settings.termsText}
            />
          </section>
        </div>

        {canEdit && (
          <div className="admin-settings-save">
            <button type="submit" className="btn btn-primary" disabled={pending}>
              {pending ? "Saving…" : "Save settings"}
            </button>
          </div>
        )}
      </fieldset>
    </form>
  );
}
