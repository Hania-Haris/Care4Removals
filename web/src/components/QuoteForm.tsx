"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitQuoteLead, type ActionResult } from "@/app/actions/leads";
import {
  UPLOAD_MAX_FILES,
  UPLOAD_MAX_BYTES,
} from "@/lib/validation/lead";

const initialState: ActionResult = { status: "idle", message: "" };

const PROPERTY_TYPES = [
  "House",
  "Flat / Apartment",
  "Bungalow",
  "Maisonette",
  "Office / Commercial",
  "Storage unit",
  "Other",
];
const BEDROOMS = ["Studio", "1 bed", "2 bed", "3 bed", "4 bed", "5+ bed"];
const FLOORS = ["Ground floor", "1st floor", "2nd floor", "3rd floor", "4th floor +", "Whole house"];
const YES_NO = ["Yes", "No"];
const LIFT = ["Lift available", "No lift", "Not applicable"];

export default function QuoteForm() {
  const [state, formAction, pending] = useActionState(
    submitQuoteLead,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [submissionId, setSubmissionId] = useState(() => crypto.randomUUID());
  const [fileCount, setFileCount] = useState(0);
  const [fileError, setFileError] = useState("");
  const todayISO = new Date().toISOString().slice(0, 10);

  const [prevStatus, setPrevStatus] = useState(state.status);
  if (state.status !== prevStatus) {
    setPrevStatus(state.status);
    if (state.status === "success") setSubmissionId(crypto.randomUUID());
  }

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      setFileCount(0);
      setFileError("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state.status]);

  const err = (f: string) => state.fieldErrors?.[f];
  const val = (f: string) => state.values?.[f] ?? "";

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length > UPLOAD_MAX_FILES) {
      setFileError(`Please choose ${UPLOAD_MAX_FILES} files or fewer.`);
    } else if (files.some((f) => f.size > UPLOAD_MAX_BYTES)) {
      setFileError("Each file must be under 8 MB.");
    } else {
      setFileError("");
    }
    setFileCount(files.length);
  }

  const field = (
    name: string,
    label: string,
    opts: {
      type?: string;
      required?: boolean;
      full?: boolean;
      autoComplete?: string;
      min?: string;
      placeholder?: string;
    } = {}
  ) => (
    <div className={`form-group${opts.full ? " full" : ""}`}>
      <label htmlFor={name}>
        {label}
        {opts.required && <span className="required">*</span>}
      </label>
      <input
        type={opts.type ?? "text"}
        id={name}
        name={name}
        required={opts.required}
        autoComplete={opts.autoComplete}
        min={opts.min}
        placeholder={opts.placeholder}
        defaultValue={val(name)}
        aria-invalid={err(name) ? "true" : undefined}
        aria-describedby={err(name) ? `${name}-error` : undefined}
      />
      {err(name) && (
        <span className="field-error" id={`${name}-error`}>
          {err(name)}
        </span>
      )}
    </div>
  );

  const select = (
    name: string,
    label: string,
    options: string[],
    opts: { required?: boolean; placeholder?: string } = {}
  ) => (
    <div className="form-group">
      <label htmlFor={name}>
        {label}
        {opts.required && <span className="required">*</span>}
      </label>
      <select
        id={name}
        name={name}
        required={opts.required}
        defaultValue={val(name)}
        aria-invalid={err(name) ? "true" : undefined}
      >
        <option value="">{opts.placeholder ?? "Select…"}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {err(name) && <span className="field-error">{err(name)}</span>}
    </div>
  );

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
        <input
          type="hidden"
          name="submissionId"
          value={submissionId}
          suppressHydrationWarning
        />

        {/* YOUR DETAILS */}
        <div className="form-section">
          <h2>Your details</h2>
          <p className="form-section-description">How can we contact you?</p>
          <div className="form-grid">
            {field("customerName", "Full name", { required: true, autoComplete: "name" })}
            {field("phone", "Phone number", { required: true, type: "tel", autoComplete: "tel" })}
            {field("email", "Email address", { required: true, type: "email", full: true, autoComplete: "email" })}
          </div>
        </div>

        {/* CURRENT PROPERTY */}
        <div className="form-section">
          <h2>Current property</h2>
          <p className="form-section-description">Where you&apos;re moving from.</p>
          <div className="form-grid">
            {field("pickupAddress", "Address", { required: true, full: true, autoComplete: "street-address" })}
            {field("pickupPostcode", "Postcode")}
            {select("pickupPropertyType", "Property type", PROPERTY_TYPES, { required: true, placeholder: "Select property type" })}
            {select("pickupBedrooms", "Size", BEDROOMS)}
            {select("pickupFloor", "Which floor?", FLOORS)}
            {select("pickupLift", "Lift access", LIFT)}
            {field("pickupAccess", "Parking / access notes", {
              full: true,
              placeholder: "e.g. permit parking only, long carry, narrow stairs",
            })}
          </div>
        </div>

        {/* NEW PROPERTY */}
        <div className="form-section">
          <h2>New property</h2>
          <p className="form-section-description">Where you&apos;re moving to.</p>
          <div className="form-grid">
            {field("deliveryAddress", "Address", { required: true, full: true })}
            {field("deliveryPostcode", "Postcode")}
            {select("deliveryPropertyType", "Property type", PROPERTY_TYPES, { required: true, placeholder: "Select property type" })}
            {select("deliveryFloor", "Which floor?", FLOORS)}
            {select("deliveryLift", "Lift access", LIFT)}
            {field("deliveryAccess", "Parking / access notes", {
              full: true,
              placeholder: "e.g. driveway, permit needed, restricted hours",
            })}
          </div>
        </div>

        {/* MOVE DETAILS */}
        <div className="form-section">
          <h2>Move details</h2>
          <p className="form-section-description">A little more information.</p>
          <div className="form-grid">
            {field("movingDate", "Preferred moving date", { type: "date", min: todayISO })}
            {select("dateFlexible", "Are your dates flexible?", ["yes", "no"], {
              placeholder: "Select…",
            })}
            <div className="form-group">
              <label htmlFor="serviceType">Main service needed</label>
              <select id="serviceType" name="serviceType" defaultValue={val("serviceType")}>
                <option value="">Select service</option>
                <option value="House Removal">House removal</option>
                <option value="Packing">Packing</option>
                <option value="Transport">Reliable transport</option>
                <option value="Multiple Services">Multiple services</option>
              </select>
            </div>
            {select("packingNeeded", "Packing help?", ["Yes — full pack", "Yes — fragile only", "No"])}
            {select("dismantlingNeeded", "Furniture dismantling / reassembly?", YES_NO)}
            {select("storageNeeded", "Storage needed?", YES_NO)}
            {field("heavyItems", "Heavy or special items", {
              full: true,
              placeholder: "e.g. piano, safe, American fridge, gym equipment",
            })}
            <div className="form-group full">
              <label htmlFor="inventoryNotes">Approximate inventory</label>
              <textarea
                id="inventoryNotes"
                name="inventoryNotes"
                placeholder="Rough list of rooms / large items so we can size the move"
                defaultValue={val("inventoryNotes")}
              />
            </div>
            <div className="form-group full">
              <label htmlFor="specialInstructions">Anything else?</label>
              <textarea
                id="specialInstructions"
                name="specialInstructions"
                placeholder="Anything else we should know about your move?"
                defaultValue={val("specialInstructions")}
              />
            </div>
          </div>
        </div>

        {/* PHOTOS */}
        <div className="form-section">
          <h2>Photos (optional)</h2>
          <p className="form-section-description">
            A few photos of the larger rooms or tricky items help us quote
            accurately. Up to {UPLOAD_MAX_FILES} images or PDFs, 8 MB each.
          </p>
          <div className="form-group full">
            <label htmlFor="photos" className="file-label">
              <span>{fileCount ? `${fileCount} file${fileCount > 1 ? "s" : ""} selected` : "Choose files"}</span>
              <input
                id="photos"
                name="photos"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
                onChange={onFiles}
              />
            </label>
            {fileError && <span className="field-error">{fileError}</span>}
          </div>
        </div>

        {/* PRIVACY */}
        <div className="form-section">
          <div className="form-group full form-checkbox-group">
            <label htmlFor="privacyAcknowledged" className="checkbox-label">
              <input
                type="checkbox"
                id="privacyAcknowledged"
                name="privacyAcknowledged"
                required
                aria-invalid={err("privacyAcknowledged") ? "true" : undefined}
              />
              <span>
                I understand my details will be used to respond to this
                enquiry, as described in the{" "}
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
        </div>

        <div className="form-submit-area">
          <button
            type="submit"
            className="btn btn-primary"
            id="submitQuote"
            disabled={pending || !!fileError}
          >
            {pending ? "Sending..." : "Request my quote"}
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
