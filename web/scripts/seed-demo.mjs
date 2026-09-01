// Seeds NON-PERSONAL demo data for UAT. Safe to run against a staging
// project; do NOT run against production.
//
// Usage (from web/):
//   FIREBASE_SERVICE_ACCOUNT_KEY=<base64> node scripts/seed-demo.mjs
//
// Creates: one quote-form lead + one contact-form lead, both with obviously
// fake data. It does NOT create quotes/jobs — walk those through the UI as
// part of UAT.

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!key) {
  console.error("FIREBASE_SERVICE_ACCOUNT_KEY required.");
  process.exit(1);
}
initializeApp({
  credential: cert(JSON.parse(Buffer.from(key, "base64").toString("utf-8"))),
});
const db = getFirestore();

const now = FieldValue.serverTimestamp();

const quoteLead = {
  customerName: "UAT Tester (quote)",
  email: "uat-quote@example.test",
  phone: "01000 000001",
  pickupAddress: "1 Test Lane, Leeds, LS1 1AA",
  pickupPropertyType: "House",
  pickupGroundFloor: "No",
  deliveryAddress: "2 Sample Road, Birmingham, B1 1BB",
  deliveryPropertyType: "Flat / Apartment",
  deliveryGroundFloor: "Yes",
  movingDate: new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10),
  serviceType: "House Removal",
  specialInstructions: "UAT seed record — safe to delete.",
  submissionId: `seed-${Date.now()}-q`,
  source: "quote-form",
  status: "new",
  priority: "normal",
  assignedTo: null,
  createdAt: now,
  updatedAt: now,
};

const contactLead = {
  customerName: "UAT Tester (contact)",
  email: "uat-contact@example.test",
  phone: "01000 000002",
  subject: "Quote question",
  message: "UAT seed record — safe to delete.",
  submissionId: `seed-${Date.now()}-c`,
  source: "contact-form",
  status: "new",
  priority: "normal",
  assignedTo: null,
  createdAt: now,
  updatedAt: now,
};

for (const lead of [quoteLead, contactLead]) {
  const ref = await db.collection("leads").add(lead);
  await db.collection("activities").add({
    entityType: "lead",
    entityId: ref.id,
    type: "created",
    actor: "system",
    metadata: { source: lead.source, seed: true },
    createdAt: now,
  });
  console.log(`✓ ${lead.source} lead ${ref.id}`);
}

console.log("Done. Now run the enquiry->job flow through the UI for UAT.");
