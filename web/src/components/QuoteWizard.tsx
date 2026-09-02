"use client";

import {
  useActionState,
  useMemo,
  useRef,
  useState,
  startTransition,
  createContext,
  useContext,
} from "react";
import Link from "next/link";
import Image from "next/image";
import Icon from "@/components/Icon";
import { submitQuoteLead, type ActionResult } from "@/app/actions/leads";
import { UPLOAD_MAX_FILES, UPLOAD_MAX_BYTES } from "@/lib/validation/lead";

const initialState: ActionResult = { status: "idle", message: "" };

const STEPS = ["Your details", "Properties", "Move details", "Review"];

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
const LIFT = ["Lift available", "No lift", "Not applicable"];

type Data = Record<string, string>;
const EMPTY: Data = {
  customerName: "",
  phone: "",
  email: "",
  pickupAddress: "",
  pickupPostcode: "",
  pickupPropertyType: "",
  pickupBedrooms: "",
  pickupFloor: "",
  pickupLift: "",
  pickupAccess: "",
  deliveryAddress: "",
  deliveryPostcode: "",
  deliveryPropertyType: "",
  deliveryFloor: "",
  deliveryLift: "",
  deliveryAccess: "",
  movingDate: "",
  dateFlexible: "",
  serviceType: "",
  packingNeeded: "",
  dismantlingNeeded: "",
  storageNeeded: "",
  heavyItems: "",
  inventoryNotes: "",
  specialInstructions: "",
};

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const todayISO = () => new Date().toISOString().slice(0, 10);

// Single source of truth for every field: which step owns it (so a server
// error jumps there) and a human label (so the error summary can name it).
// Every <Field>/<Select> passes its `name`; the context below resolves the
// server error for that name automatically, so a field can never silently
// swallow a validation error.
const FIELDS: Record<string, { step: number; label: string }> = {
  customerName: { step: 0, label: "Full name" },
  phone: { step: 0, label: "Phone number" },
  email: { step: 0, label: "Email address" },
  pickupAddress: { step: 1, label: "Moving from — address" },
  pickupPostcode: { step: 1, label: "Moving from — postcode" },
  pickupPropertyType: { step: 1, label: "Moving from — property type" },
  pickupBedrooms: { step: 1, label: "Moving from — size" },
  pickupFloor: { step: 1, label: "Moving from — floor" },
  pickupLift: { step: 1, label: "Moving from — lift access" },
  pickupAccess: { step: 1, label: "Moving from — parking / access notes" },
  deliveryAddress: { step: 1, label: "Moving to — address" },
  deliveryPostcode: { step: 1, label: "Moving to — postcode" },
  deliveryPropertyType: { step: 1, label: "Moving to — property type" },
  deliveryFloor: { step: 1, label: "Moving to — floor" },
  deliveryLift: { step: 1, label: "Moving to — lift access" },
  deliveryAccess: { step: 1, label: "Moving to — parking / access notes" },
  movingDate: { step: 2, label: "Preferred moving date" },
  dateFlexible: { step: 2, label: "Dates flexible" },
  serviceType: { step: 2, label: "Main service needed" },
  packingNeeded: { step: 2, label: "Packing help" },
  dismantlingNeeded: { step: 2, label: "Dismantling / reassembly" },
  storageNeeded: { step: 2, label: "Storage needed" },
  heavyItems: { step: 2, label: "Heavy or special items" },
  inventoryNotes: { step: 2, label: "Approximate inventory" },
  specialInstructions: { step: 2, label: "Anything else" },
  privacyAcknowledged: { step: 3, label: "Privacy acknowledgement" },
};
const fieldStep = (name: string) => FIELDS[name]?.step ?? -1;

const ErrCtx = createContext<Record<string, string> | undefined>(undefined);

export default function QuoteWizard() {
  const [state, dispatch, pending] = useActionState(
    submitQuoteLead,
    initialState
  );
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Data>(EMPTY);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [ack, setAck] = useState(false);
  const [touched, setTouched] = useState(false);
  const submissionId = useRef(crypto.randomUUID());

  // If the server rejected a field, hop to the step that owns it and mark the
  // fields dirty so the specific errors show. Derived during render.
  const [seenErrorAt, setSeenErrorAt] = useState<Record<string, string> | null>(
    null
  );
  if (
    state.status === "error" &&
    state.fieldErrors &&
    state.fieldErrors !== seenErrorAt
  ) {
    setSeenErrorAt(state.fieldErrors);
    const steps = Object.keys(state.fieldErrors)
      .map(fieldStep)
      .filter((n) => n >= 0);
    if (steps.length) setStep(Math.min(...steps));
    setTouched(true);
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setData((d) => ({ ...d, [k]: e.target.value }));

  const stepValid = useMemo(() => {
    if (step === 0)
      return (
        data.customerName.trim() !== "" &&
        data.phone.trim() !== "" &&
        emailOk(data.email.trim())
      );
    if (step === 1)
      return (
        data.pickupAddress.trim() !== "" &&
        data.pickupPropertyType !== "" &&
        data.deliveryAddress.trim() !== "" &&
        data.deliveryPropertyType !== ""
      );
    if (step === 2)
      return data.movingDate === "" || data.movingDate >= todayISO();
    if (step === 3) return ack;
    return true;
  }, [step, data, ack]);

  function next() {
    if (!stepValid) {
      setTouched(true);
      return;
    }
    setTouched(false);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function back() {
    setTouched(false);
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []);
    if (list.length > UPLOAD_MAX_FILES) {
      setFileError(`Choose ${UPLOAD_MAX_FILES} files or fewer.`);
      setFiles([]);
      return;
    }
    if (list.some((f) => f.size > UPLOAD_MAX_BYTES)) {
      setFileError("Each file must be under 8 MB.");
      setFiles([]);
      return;
    }
    setFileError("");
    setFiles(list);
  }

  function submit() {
    if (!ack) {
      setTouched(true);
      return;
    }
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.set(k, v));
    fd.set("privacyAcknowledged", "on");
    fd.set("submissionId", submissionId.current);
    files.forEach((f) => fd.append("photos", f));
    startTransition(() => dispatch(fd));
  }

  if (state.status === "success") {
    return (
      <div className="qw-done">
        <span className="qw-done-icon">
          <Icon name="check" size={34} />
        </span>
        <h1>Thank you — your enquiry is in</h1>
        <p>{state.message}</p>
        <Link href="/" className="btn btn-primary">Back to home</Link>
      </div>
    );
  }

  const err = (cond: boolean) => touched && cond;
  // client-side message only — server errors are resolved by <Field>/<Select>
  // themselves via ErrCtx, keyed on their `name`, so none can be missed.
  const clientErr = (cond: boolean, msg: string) => (touched && cond ? msg : "");

  const serverErrors =
    state.status === "error" ? state.fieldErrors : undefined;

  return (
   <ErrCtx.Provider value={serverErrors}>
    <div className="qw">
      {/* step indicator */}
      <ol className="qw-steps" aria-label="Progress">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`qw-step-tab${i === step ? " is-current" : ""}${
              i < step ? " is-done" : ""
            }`}
          >
            <span className="qw-step-badge">
              {i < step ? <Icon name="check" size={20} /> : i + 1}
            </span>
            <span className="qw-step-label">{label}</span>
            {i < STEPS.length - 1 && (
              <Icon name="arrow-right" size={22} className="qw-step-arrow" />
            )}
          </li>
        ))}
      </ol>

      <div className="qw-layout">
        {/* main card */}
        <div className="qw-card">
          {state.status === "error" &&
            (() => {
              if (!state.fieldErrors)
                return (
                  <div className="qw-alert" role="status">
                    {state.message}
                  </div>
                );
              const entries = Object.entries(state.fieldErrors);
              // unknown keys (step < 0) surface on the current step so their
              // message is never hidden, even with nothing to highlight
              const here = entries.filter(
                ([k]) => fieldStep(k) === step || fieldStep(k) < 0
              );
              const elsewhere = entries.filter(
                ([k]) => fieldStep(k) >= 0 && fieldStep(k) !== step
              );
              const label = (k: string) => FIELDS[k]?.label ?? k;
              return (
                <div className="qw-alert" role="alert">
                  <strong>
                    {here.length
                      ? "Please fix these fields — they're highlighted below:"
                      : "Some details need fixing on another step:"}
                  </strong>
                  <ul>
                    {(here.length ? here : elsewhere).map(([k, msg]) => (
                      <li key={k}>
                        <b>{label(k)}</b> — {msg}
                        {!here.length && (
                          <> (step {fieldStep(k) + 1}: {STEPS[fieldStep(k)]})</>
                        )}
                      </li>
                    ))}
                  </ul>
                  {here.length > 0 && elsewhere.length > 0 && (
                    <span className="qw-alert-more">
                      Then check {elsewhere.length} more field
                      {elsewhere.length > 1 ? "s" : ""}:{" "}
                      {elsewhere.map(([k]) => label(k)).join(", ")}.
                    </span>
                  )}
                </div>
              );
            })()}

          {step === 0 && (
            <>
              <h1>
                Tell us about <span>your move.</span>
              </h1>
              <p className="qw-required-hint">
                Fields marked <b>*</b> are required.
              </p>
              <div className="qw-fields">
                <Field required name="customerName" label="Full name" error={clientErr(data.customerName.trim() === "", "Please enter your name")}>
                  <span className="qw-input">
                    <Icon name="user" size={18} />
                    <input
                      value={data.customerName}
                      onChange={set("customerName")}
                      placeholder="e.g. Jane Smith"
                      autoComplete="name"
                    />
                  </span>
                </Field>
                <Field required name="phone" label="Phone number" error={clientErr(data.phone.trim() === "", "Please enter a phone number")}>
                  <span className="qw-input">
                    <Icon name="phone" size={18} />
                    <input
                      type="tel"
                      value={data.phone}
                      onChange={set("phone")}
                      placeholder="e.g. 07912 345678"
                      autoComplete="tel"
                    />
                  </span>
                </Field>
                <Field required name="email" label="Email address" error={clientErr(!emailOk(data.email.trim()), "Please enter a valid email")}>
                  <span className="qw-input">
                    <Icon name="mail" size={18} />
                    <input
                      type="email"
                      value={data.email}
                      onChange={set("email")}
                      placeholder="e.g. jane.smith@email.co.uk"
                      autoComplete="email"
                    />
                  </span>
                </Field>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h1>Your <span>properties.</span></h1>
              <p className="qw-required-hint">
                Fields marked <b>*</b> are required.
              </p>
              <h3 className="qw-subhead">Moving from</h3>
              <div className="qw-fields qw-grid">
                <Field required name="pickupAddress" label="Address" wide error={clientErr(data.pickupAddress.trim() === "", "Please enter the address")}>
                  <input value={data.pickupAddress} onChange={set("pickupAddress")} placeholder="Street and town" autoComplete="street-address" />
                </Field>
                <Field name="pickupPostcode" label="Postcode">
                  <input value={data.pickupPostcode} onChange={set("pickupPostcode")} placeholder="LS1 1AA" maxLength={12} />
                </Field>
                <Select required name="pickupPropertyType" label="Property type" value={data.pickupPropertyType} onChange={set("pickupPropertyType")} options={PROPERTY_TYPES} placeholder="Select type" error={clientErr(data.pickupPropertyType === "", "Please choose a property type")} />
                <Select name="pickupBedrooms" label="Size" value={data.pickupBedrooms} onChange={set("pickupBedrooms")} options={BEDROOMS} />
                <Select name="pickupFloor" label="Which floor?" value={data.pickupFloor} onChange={set("pickupFloor")} options={FLOORS} />
                <Select name="pickupLift" label="Lift access" value={data.pickupLift} onChange={set("pickupLift")} options={LIFT} />
                <Field name="pickupAccess" label="Parking / access notes" wide>
                  <input value={data.pickupAccess} onChange={set("pickupAccess")} placeholder="e.g. permit parking, narrow stairs, long carry" maxLength={400} />
                </Field>
              </div>

              <h3 className="qw-subhead">Moving to</h3>
              <div className="qw-fields qw-grid">
                <Field required name="deliveryAddress" label="Address" wide error={clientErr(data.deliveryAddress.trim() === "", "Please enter the address")}>
                  <input value={data.deliveryAddress} onChange={set("deliveryAddress")} placeholder="Street and town" />
                </Field>
                <Field name="deliveryPostcode" label="Postcode">
                  <input value={data.deliveryPostcode} onChange={set("deliveryPostcode")} placeholder="B1 1AA" maxLength={12} />
                </Field>
                <Select required name="deliveryPropertyType" label="Property type" value={data.deliveryPropertyType} onChange={set("deliveryPropertyType")} options={PROPERTY_TYPES} placeholder="Select type" error={clientErr(data.deliveryPropertyType === "", "Please choose a property type")} />
                <Select name="deliveryFloor" label="Which floor?" value={data.deliveryFloor} onChange={set("deliveryFloor")} options={FLOORS} />
                <Select name="deliveryLift" label="Lift access" value={data.deliveryLift} onChange={set("deliveryLift")} options={LIFT} />
                <Field name="deliveryAccess" label="Parking / access notes" wide>
                  <input value={data.deliveryAccess} onChange={set("deliveryAccess")} placeholder="e.g. driveway, restricted hours" maxLength={400} />
                </Field>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1>Move <span>details.</span></h1>
              <div className="qw-fields qw-grid">
                <Field
                  name="movingDate"
                  label="Preferred moving date"
                  error={clientErr(
                    data.movingDate !== "" && data.movingDate < todayISO(),
                    "Moving date can't be in the past"
                  )}
                >
                  <input type="date" value={data.movingDate} onChange={set("movingDate")} min={todayISO()} />
                </Field>
                <Select name="dateFlexible" label="Dates flexible?" value={data.dateFlexible} onChange={set("dateFlexible")} options={["yes", "no"]} />
                <Select name="serviceType" label="Main service needed" value={data.serviceType} onChange={set("serviceType")} options={["House Removal", "Packing", "Transport", "Multiple Services"]} />
                <Select name="packingNeeded" label="Packing help?" value={data.packingNeeded} onChange={set("packingNeeded")} options={["Yes — full pack", "Yes — fragile only", "No"]} />
                <Select name="dismantlingNeeded" label="Dismantling / reassembly?" value={data.dismantlingNeeded} onChange={set("dismantlingNeeded")} options={["Yes", "No"]} />
                <Select name="storageNeeded" label="Storage needed?" value={data.storageNeeded} onChange={set("storageNeeded")} options={["Yes", "No"]} />
                <Field name="heavyItems" label="Heavy or special items" wide>
                  <input value={data.heavyItems} onChange={set("heavyItems")} placeholder="e.g. piano, safe, American fridge" maxLength={600} />
                </Field>
                <Field name="inventoryNotes" label="Approximate inventory" wide>
                  <textarea value={data.inventoryNotes} onChange={set("inventoryNotes")} placeholder="Rough list of rooms and large items" maxLength={2000} />
                </Field>
                <Field name="specialInstructions" label="Anything else?" wide>
                  <textarea value={data.specialInstructions} onChange={set("specialInstructions")} placeholder="Anything else we should know" maxLength={2000} />
                </Field>
              </div>

              <div className="qw-upload">
                <label htmlFor="qw-photos" className="qw-upload-drop">
                  <Icon name="camera" size={22} />
                  <span>{files.length ? `${files.length} file${files.length > 1 ? "s" : ""} selected` : "Add photos of rooms or tricky items (optional)"}</span>
                  <input id="qw-photos" type="file" multiple accept="image/jpeg,image/png,image/webp,image/heic,application/pdf" onChange={onFiles} />
                </label>
                {fileError && <span className="qw-field-error">{fileError}</span>}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1>Review &amp; <span>send.</span></h1>
              <dl className="qw-review">
                <Row k="Name" v={data.customerName} />
                <Row k="Contact" v={[data.phone, data.email].filter(Boolean).join(" · ")} />
                <Row k="Moving from" v={[data.pickupAddress, data.pickupPostcode, data.pickupPropertyType].filter(Boolean).join(", ")} />
                <Row k="Moving to" v={[data.deliveryAddress, data.deliveryPostcode, data.deliveryPropertyType].filter(Boolean).join(", ")} />
                <Row k="Date" v={data.movingDate ? new Date(data.movingDate).toLocaleDateString("en-GB") : "Flexible / not set"} />
                <Row k="Service" v={data.serviceType || "Not set"} />
                <Row k="Photos" v={files.length ? `${files.length} attached` : "None"} />
              </dl>

              <label className="qw-check">
                <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />
                <span>
                  I understand my details will be used to respond to this enquiry, as set out in the{" "}
                  <a href="/legal/privacy" target="_blank" rel="noreferrer">Privacy Policy</a> and{" "}
                  <a href="/legal/terms" target="_blank" rel="noreferrer">Terms</a>.
                </span>
              </label>
              {err(!ack) && <span className="qw-field-error">Please tick the box to continue</span>}
            </>
          )}

          <div className="qw-nav">
            <button type="button" className="btn btn-ghost" onClick={back} disabled={step === 0 || pending}>
              <Icon name="arrow-left" size={18} /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button type="button" className="btn btn-primary" onClick={next}>
                Continue <Icon name="arrow-right" size={18} />
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={submit} disabled={pending}>
                {pending ? "Sending…" : "Send my enquiry"}
                {!pending && <Icon name="arrow-right" size={18} />}
              </button>
            )}
          </div>
        </div>

        {/* summary sidebar */}
        <aside className="qw-summary">
          <h2>Your move</h2>
          <div className="qw-summary-row">
            <span className="qw-summary-ic"><Icon name="home" size={18} /></span>
            <div>
              <strong>Current home</strong>
              <span>{data.pickupAddress || "Not set"}</span>
            </div>
          </div>
          <div className="qw-summary-dots" aria-hidden="true" />
          <div className="qw-summary-row">
            <span className="qw-summary-ic"><Icon name="building" size={18} /></span>
            <div>
              <strong>New home</strong>
              <span>{data.deliveryAddress || "Not set"}</span>
            </div>
          </div>
          <div className="qw-summary-sep" />
          <div className="qw-summary-row">
            <span className="qw-summary-ic"><Icon name="calendar" size={18} /></span>
            <div>
              <strong>Moving date</strong>
              <span>{data.movingDate ? new Date(data.movingDate).toLocaleDateString("en-GB") : "Not set"}</span>
            </div>
          </div>
          <div className="qw-summary-row">
            <span className="qw-summary-ic"><Icon name="box" size={18} /></span>
            <div>
              <strong>Service</strong>
              <span>{data.serviceType || "Not set"}</span>
            </div>
          </div>

          <Image
            src="/assets/why-coordinated.png"
            alt=""
            width={760}
            height={321}
            className="qw-summary-art"
          />

          <div className="qw-reassure">
            <Icon name="shield-check" size={22} />
            <div>
              <strong>No obligation.</strong>
              <span>We&apos;ll review your details and send a clear quote.</span>
            </div>
          </div>
        </aside>
      </div>

      {/* trust strip */}
      <div className="qw-trust">
        <div><Icon name="lock" size={20} /><span>Your details are kept private</span></div>
        <div><Icon name="file" size={20} /><span>Clear written quotation</span></div>
        <div><Icon name="map-pin" size={20} /><span>Local Leeds &amp; Birmingham support</span></div>
      </div>
    </div>
   </ErrCtx.Provider>
  );
}

function useFieldError(name: string | undefined, clientError?: string) {
  const serverErrors = useContext(ErrCtx);
  if (name && serverErrors?.[name]) return serverErrors[name];
  return clientError || "";
}

function Field({
  label,
  children,
  wide,
  error,
  required,
  name,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
  error?: string;
  required?: boolean;
  name?: string;
}) {
  const shown = useFieldError(name, error);
  return (
    <div
      className={`qw-field${wide ? " wide" : ""}${shown ? " has-error" : ""}`}
      data-field={name}
    >
      <label>
        {label}
        {required && <span className="qw-req" aria-hidden="true"> *</span>}
      </label>
      {children}
      {shown && <span className="qw-field-error">{shown}</span>}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  placeholder = "Select…",
  error,
  required,
  name,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  name?: string;
}) {
  const shown = useFieldError(name, error);
  return (
    <div className={`qw-field${shown ? " has-error" : ""}`} data-field={name}>
      <label>
        {label}
        {required && <span className="qw-req" aria-hidden="true"> *</span>}
      </label>
      <select value={value} onChange={onChange}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {shown && <span className="qw-field-error">{shown}</span>}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="qw-review-row">
      <dt>{k}</dt>
      <dd>{v || "—"}</dd>
    </div>
  );
}
