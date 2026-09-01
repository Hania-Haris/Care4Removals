"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitQuoteLead, type ActionResult } from "@/app/actions/leads";

const initialState: ActionResult = { status: "idle", message: "" };

export default function QuoteForm() {
  const [state, formAction, pending] = useActionState(
    submitQuoteLead,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [submissionId, setSubmissionId] = useState(() => crypto.randomUUID());
  const todayISO = new Date().toISOString().slice(0, 10);

  // Regenerate the idempotency key when a submit just succeeded, derived
  // during render rather than in an effect (see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  // A resubmission carrying the SAME key (double-click, network retry) is
  // recognized server-side and not duplicated; a genuinely new enquiry after
  // a successful one gets a fresh key so it isn't mistaken for a repeat.
  const [prevStatus, setPrevStatus] = useState(state.status);
  if (state.status !== prevStatus) {
    setPrevStatus(state.status);
    if (state.status === "success") {
      setSubmissionId(crypto.randomUUID());
    }
  }

  // Imperative DOM side effects only (form reset, scroll) — no setState here.
  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state.status]);

  const err = (field: string) => state.fieldErrors?.[field];

  return (
    <>
      <div
        id="formMessage"
        className={`form-message${state.status !== "idle" ? " show" : ""}${
          state.status === "error" ? " error" : ""
        }${state.status === "success" ? " success" : ""}`}
        role="status"
        aria-live="polite"
      >
        {state.message}
      </div>

      <form id="quoteForm" ref={formRef} action={formAction} noValidate>
        {/* suppressHydrationWarning: the UUID legitimately differs between the
            server-rendered and client-hydrated value; hidden, no visual/user
            impact, and the client value is what actually gets submitted. */}
        <input
          type="hidden"
          name="submissionId"
          value={submissionId}
          suppressHydrationWarning
        />

        {/* ================= YOUR DETAILS ================= */}
        <div className="form-section">
          <h2>Your details</h2>
          <p className="form-section-description">How can we contact you?</p>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="customerName">
                Full name<span className="required">*</span>
              </label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                required
                autoComplete="name"
                defaultValue={state.values?.customerName ?? ""}
                aria-invalid={err("customerName") ? "true" : undefined}
                aria-describedby={
                  err("customerName") ? "customerName-error" : undefined
                }
              />
              {err("customerName") && (
                <span className="field-error" id="customerName-error">
                  {err("customerName")}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                Phone number<span className="required">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                autoComplete="tel"
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

            <div className="form-group full">
              <label htmlFor="email">
                Email address<span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                autoComplete="email"
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
          </div>
        </div>

        {/* ================= CURRENT PROPERTY ================= */}
        <div className="form-section">
          <h2>Current property</h2>
          <p className="form-section-description">
            Tell us where you&apos;re moving from.
          </p>

          <div className="form-grid">
            <div className="form-group full">
              <label htmlFor="pickupAddress">
                Pickup address<span className="required">*</span>
              </label>
              <input
                type="text"
                id="pickupAddress"
                name="pickupAddress"
                required
                autoComplete="street-address"
                defaultValue={state.values?.pickupAddress ?? ""}
                aria-invalid={err("pickupAddress") ? "true" : undefined}
                aria-describedby={
                  err("pickupAddress") ? "pickupAddress-error" : undefined
                }
              />
              {err("pickupAddress") && (
                <span className="field-error" id="pickupAddress-error">
                  {err("pickupAddress")}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="pickupPropertyType">
                Property type<span className="required">*</span>
              </label>
              <select
                id="pickupPropertyType"
                name="pickupPropertyType"
                required
                defaultValue={state.values?.pickupPropertyType ?? ""}
                aria-invalid={err("pickupPropertyType") ? "true" : undefined}
              >
                <option value="">Select property type</option>
                <option value="House">House</option>
                <option value="Flat / Apartment">Flat / Apartment</option>
                <option value="Bungalow">Bungalow</option>
                <option value="Office / Commercial">
                  Office / Commercial
                </option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="pickupGroundFloor">
                Is the property ground floor?
              </label>
              <select
                id="pickupGroundFloor"
                name="pickupGroundFloor"
                defaultValue={state.values?.pickupGroundFloor ?? ""}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* ================= DESTINATION ================= */}
        <div className="form-section">
          <h2>New property</h2>
          <p className="form-section-description">
            Tell us where you&apos;re moving to.
          </p>

          <div className="form-grid">
            <div className="form-group full">
              <label htmlFor="deliveryAddress">
                Delivery address<span className="required">*</span>
              </label>
              <input
                type="text"
                id="deliveryAddress"
                name="deliveryAddress"
                required
                defaultValue={state.values?.deliveryAddress ?? ""}
                aria-invalid={err("deliveryAddress") ? "true" : undefined}
                aria-describedby={
                  err("deliveryAddress") ? "deliveryAddress-error" : undefined
                }
              />
              {err("deliveryAddress") && (
                <span className="field-error" id="deliveryAddress-error">
                  {err("deliveryAddress")}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="deliveryPropertyType">
                Property type<span className="required">*</span>
              </label>
              <select
                id="deliveryPropertyType"
                name="deliveryPropertyType"
                required
                defaultValue={state.values?.deliveryPropertyType ?? ""}
              >
                <option value="">Select property type</option>
                <option value="House">House</option>
                <option value="Flat / Apartment">Flat / Apartment</option>
                <option value="Bungalow">Bungalow</option>
                <option value="Office / Commercial">
                  Office / Commercial
                </option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="deliveryGroundFloor">
                Is the property ground floor?
              </label>
              <select
                id="deliveryGroundFloor"
                name="deliveryGroundFloor"
                defaultValue={state.values?.deliveryGroundFloor ?? ""}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* ================= MOVE DETAILS ================= */}
        <div className="form-section">
          <h2>Move details</h2>
          <p className="form-section-description">
            Give us a little more information.
          </p>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="movingDate">Preferred moving date</label>
              <input
                type="date"
                id="movingDate"
                name="movingDate"
                min={todayISO}
                defaultValue={state.values?.movingDate ?? ""}
                aria-invalid={err("movingDate") ? "true" : undefined}
                aria-describedby={
                  err("movingDate") ? "movingDate-error" : undefined
                }
              />
              {err("movingDate") && (
                <span className="field-error" id="movingDate-error">
                  {err("movingDate")}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="serviceType">Service required</label>
              {/* Options aligned to the confirmed services listed on /services —
                  "Office Move" and "Storage" were removed here: they were offered
                  in the legacy form but are not sellable services on the site
                  (Phase 2 QA finding, DECISIONS_REQUIRED.md #4). */}
              <select id="serviceType" name="serviceType" defaultValue="">
                <option value="">Select service</option>
                <option value="House Removal">House Removal</option>
                <option value="Packing">Packing</option>
                <option value="Transport">Reliable Transport</option>
                <option value="Multiple Services">Multiple Services</option>
              </select>
            </div>

            <div className="form-group full">
              <label htmlFor="specialInstructions">
                Special instructions
              </label>
              <textarea
                id="specialInstructions"
                name="specialInstructions"
                placeholder="Anything else we should know about your move?"
                defaultValue={state.values?.specialInstructions ?? ""}
              ></textarea>
            </div>
          </div>
        </div>

        {/* ================= PRIVACY ================= */}
        <div className="form-section">
          <div className="form-group full form-checkbox-group">
            <label htmlFor="privacyAcknowledged" className="checkbox-label">
              <input
                type="checkbox"
                id="privacyAcknowledged"
                name="privacyAcknowledged"
                required
                aria-invalid={
                  err("privacyAcknowledged") ? "true" : undefined
                }
                aria-describedby={
                  err("privacyAcknowledged")
                    ? "privacyAcknowledged-error"
                    : undefined
                }
              />
              <span>
                I understand my details will be used to respond to this
                enquiry.{" "}
                <em>
                  (A full Privacy Policy is in progress — Phase 10 of this
                  build.)
                </em>
              </span>
            </label>
            {err("privacyAcknowledged") && (
              <span className="field-error" id="privacyAcknowledged-error">
                {err("privacyAcknowledged")}
              </span>
            )}
          </div>
        </div>

        {/* ================= SUBMIT ================= */}
        <div className="form-submit-area">
          <button
            type="submit"
            className="btn btn-primary"
            id="submitQuote"
            disabled={pending}
          >
            {pending ? "Sending..." : "Request My Quote"}
            {!pending && <span aria-hidden="true">→</span>}
          </button>

          <p className="form-note">
            We&apos;ll use the information you provide to respond to your
            removal enquiry.
          </p>
        </div>
      </form>
    </>
  );
}
