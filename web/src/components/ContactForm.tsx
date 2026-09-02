"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitContactMessage, type ActionResult } from "@/app/actions/leads";

const initialState: ActionResult = { status: "idle", message: "" };

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitContactMessage,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [submissionId, setSubmissionId] = useState(() => crypto.randomUUID());

  // See QuoteForm.tsx for why this is derived during render, not an effect.
  const [prevStatus, setPrevStatus] = useState(state.status);
  if (state.status !== prevStatus) {
    setPrevStatus(state.status);
    if (state.status === "success") {
      setSubmissionId(crypto.randomUUID());
    }
  }

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  const err = (field: string) => state.fieldErrors?.[field];

  return (
    <form id="contactForm" ref={formRef} action={formAction} noValidate>
      <input
        type="hidden"
        name="submissionId"
        value={submissionId}
        suppressHydrationWarning
      />

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">
            Name <span className="required">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            defaultValue={state.values?.name ?? ""}
            aria-invalid={err("name") ? "true" : undefined}
            aria-describedby={err("name") ? "name-error" : undefined}
          />
          {err("name") && (
            <span className="field-error" id="name-error">
              {err("name")}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="phone">
            Phone <span className="required">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            defaultValue={state.values?.phone ?? ""}
            aria-invalid={err("phone") ? "true" : undefined}
            aria-describedby={err("phone") ? "phone-error" : undefined}
          />
          {err("phone") && (
            <span className="field-error" id="phone-error">
              {err("phone")}
            </span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="email">
          Email <span className="required">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email ?? ""}
          aria-invalid={err("email") ? "true" : undefined}
          aria-describedby={err("email") ? "email-error" : undefined}
        />
        {err("email") && (
          <span className="field-error" id="email-error">
            {err("email")}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="subject">
          What can we help with? <span className="required">*</span>
        </label>
        {/* Non-selectable default option, per Phase 4 — previously
            "General enquiry" was pre-selected, so a customer who never
            touched the dropdown silently submitted the wrong routing subject. */}
        <select
          id="subject"
          name="subject"
          required
          defaultValue={state.values?.subject ?? ""}
          aria-invalid={err("subject") ? "true" : undefined}
        >
          <option value="" disabled>
            Select a subject
          </option>
          <option value="General enquiry">General enquiry</option>
          <option value="Removal enquiry">Removal enquiry</option>
          <option value="Existing booking">Existing booking</option>
          <option value="Quote question">Quote question</option>
        </select>
        {err("subject") && (
          <span className="field-error">{err("subject")}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="message">
          Message <span className="required">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          placeholder="Tell us how we can help..."
          aria-invalid={err("message") ? "true" : undefined}
          aria-describedby={err("message") ? "message-error" : undefined}
          defaultValue={state.values?.message ?? ""}
        ></textarea>
        {err("message") && (
          <span className="field-error" id="message-error">
            {err("message")}
          </span>
        )}
      </div>

      <div className="form-group form-checkbox-group">
        <label htmlFor="privacyAcknowledged" className="checkbox-label">
          <input
            type="checkbox"
            id="privacyAcknowledged"
            name="privacyAcknowledged"
            required
            aria-invalid={err("privacyAcknowledged") ? "true" : undefined}
          />
          <span>
            I understand my details will be used to respond to this enquiry,
            as described in the{" "}
            <a href="/legal/privacy" target="_blank" rel="noreferrer">
              Privacy Policy
            </a>{" "}
            and{" "}
            <a href="/legal/terms" target="_blank" rel="noreferrer">
              Terms
            </a>
            .
          </span>
        </label>
        {err("privacyAcknowledged") && (
          <span className="field-error">{err("privacyAcknowledged")}</span>
        )}
      </div>

      <p className="form-note">
        By submitting this form, you are sending your enquiry to
        Care4Removals for review.
      </p>

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Sending..." : "Send Message"}
        {!pending && <span aria-hidden="true">→</span>}
      </button>

      <div
        id="formStatus"
        className={`form-status${state.status !== "idle" ? " show" : ""}${
          state.status === "error" ? " error" : ""
        }`}
        role="status"
        aria-live="polite"
      >
        {state.message}
      </div>
    </form>
  );
}
