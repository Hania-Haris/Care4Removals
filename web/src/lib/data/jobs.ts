import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import type { JobStatus } from "@/lib/types";

import { JOB_STATUSES, JOB_TRANSITIONS } from "./job-constants";
export { JOB_STATUSES, JOB_TRANSITIONS };

type ISODate = string | null;
function toIso(v: unknown): ISODate {
  if (v && typeof v === "object" && "toDate" in v) {
    return (v as { toDate(): Date }).toDate().toISOString();
  }
  return null;
}

export type JobRecord = {
  id: string;
  quoteId: string;
  quoteVersionId: string;
  leadId: string;
  customerId: string | null;
  status: JobStatus;
  snapshot: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    pickupAddress: string;
    deliveryAddress: string;
    movingDate: string | null;
    serviceType: string | null;
    total: number;
    lineItems: { description: string; category: string; quantity: number; unitPrice: number; total: number }[];
  };
  createdAt: ISODate;
  updatedAt: ISODate;
};

function mapJob(doc: FirebaseFirestore.DocumentSnapshot): JobRecord {
  const d = doc.data() ?? {};
  return {
    id: doc.id,
    quoteId: d.quoteId ?? "",
    quoteVersionId: d.quoteVersionId ?? "",
    leadId: d.leadId ?? "",
    customerId: d.customerId ?? null,
    status: (d.status as JobStatus) ?? "pending-confirmation",
    snapshot: d.snapshot ?? {},
    createdAt: toIso(d.createdAt),
    updatedAt: toIso(d.updatedAt),
  };
}

export async function getJob(id: string): Promise<JobRecord | null> {
  const snap = await getAdminDb().collection("jobs").doc(id).get();
  return snap.exists ? mapJob(snap) : null;
}

export async function getJobByQuote(quoteId: string): Promise<JobRecord | null> {
  const snap = await getAdminDb()
    .collection("jobs")
    .where("quoteId", "==", quoteId)
    .limit(1)
    .get();
  return snap.empty ? null : mapJob(snap.docs[0]!);
}

export async function listJobs(status?: JobStatus): Promise<JobRecord[]> {
  // Order by createdAt only (auto-indexed); status filter applied in memory.
  const snap = await getAdminDb()
    .collection("jobs")
    .orderBy("createdAt", "desc")
    .limit(status ? 200 : 50)
    .get();
  let rows = snap.docs.map(mapJob);
  if (status) rows = rows.filter((j) => j.status === status).slice(0, 50);
  return rows;
}
