import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import type { Lead, LeadStatus, LeadSource } from "@/lib/types";

import { LEAD_STATUSES, LEAD_TRANSITIONS } from "./lead-constants";
export { LEAD_STATUSES, LEAD_TRANSITIONS };

type ISODate = string | null;

function toIso(v: unknown): ISODate {
  if (v && typeof v === "object" && "toDate" in v) {
    return (v as { toDate(): Date }).toDate().toISOString();
  }
  return null;
}

export type LeadListItem = Lead & {
  createdAt: ISODate;
  updatedAt: ISODate;
};

export type LeadPage = {
  items: LeadListItem[];
  hasMore: boolean;
  nextCursor: string | null;
};

const PAGE_SIZE = 25;

function mapDoc(
  doc: FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot
): LeadListItem {
  const d = doc.data() ?? {};
  return {
    id: doc.id,
    customerName: d.customerName ?? "",
    email: d.email ?? "",
    phone: d.phone ?? "",
    pickupAddress: d.pickupAddress ?? undefined,
    pickupPropertyType: d.pickupPropertyType ?? undefined,
    pickupGroundFloor: d.pickupGroundFloor ?? undefined,
    deliveryAddress: d.deliveryAddress ?? undefined,
    deliveryPropertyType: d.deliveryPropertyType ?? undefined,
    deliveryGroundFloor: d.deliveryGroundFloor ?? undefined,
    movingDate: d.movingDate ?? undefined,
    serviceType: d.serviceType ?? undefined,
    specialInstructions: d.specialInstructions ?? undefined,
    subject: d.subject ?? undefined,
    message: d.message ?? undefined,
    source: (d.source as LeadSource) ?? "quote-form",
    status: (d.status as LeadStatus) ?? "new",
    assignedTo: d.assignedTo ?? null,
    priority: d.priority ?? "normal",
    createdAt: toIso(d.createdAt),
    updatedAt: toIso(d.updatedAt),
  };
}

/**
 * Paginated, filterable lead list. Cursor-based (createdAt of the last item)
 * so it stays cheap as the collection grows — never an unbounded read.
 */
export async function listLeads(opts: {
  status?: LeadStatus;
  source?: LeadSource;
  cursor?: string;
}): Promise<LeadPage> {
  const db = getAdminDb();
  let q: FirebaseFirestore.Query = db.collection("leads");

  if (opts.status) q = q.where("status", "==", opts.status);
  if (opts.source) q = q.where("source", "==", opts.source);

  q = q.orderBy("createdAt", "desc").limit(PAGE_SIZE + 1);

  if (opts.cursor) {
    const cursorDoc = await db.collection("leads").doc(opts.cursor).get();
    if (cursorDoc.exists) q = q.startAfter(cursorDoc);
  }

  const snap = await q.get();
  const docs = snap.docs.slice(0, PAGE_SIZE);
  const hasMore = snap.docs.length > PAGE_SIZE;

  return {
    items: docs.map(mapDoc),
    hasMore,
    nextCursor: hasMore ? docs[docs.length - 1]!.id : null,
  };
}

export async function getLead(id: string): Promise<LeadListItem | null> {
  const snap = await getAdminDb().collection("leads").doc(id).get();
  if (!snap.exists) return null;
  return mapDoc(snap);
}

export async function getLeadStatusCounts(): Promise<
  Record<LeadStatus, number>
> {
  const db = getAdminDb();
  const counts = Object.fromEntries(
    LEAD_STATUSES.map((s) => [s, 0])
  ) as Record<LeadStatus, number>;

  await Promise.all(
    LEAD_STATUSES.map(async (status) => {
      const agg = await db
        .collection("leads")
        .where("status", "==", status)
        .count()
        .get();
      counts[status] = agg.data().count;
    })
  );

  return counts;
}

export type Activity = {
  id: string;
  type: string;
  actor: string;
  metadata: Record<string, unknown>;
  createdAt: ISODate;
};

export async function getLeadActivities(leadId: string): Promise<Activity[]> {
  const snap = await getAdminDb()
    .collection("activities")
    .where("entityType", "==", "lead")
    .where("entityId", "==", leadId)
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  return snap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      type: d.type ?? "",
      actor: d.actor ?? "system",
      metadata: d.metadata ?? {},
      createdAt: toIso(d.createdAt),
    };
  });
}

export async function listStaffUsers(): Promise<
  { uid: string; email: string; displayName: string }[]
> {
  const snap = await getAdminDb().collection("users").where("active", "==", true).get();
  return snap.docs.map((doc) => {
    const d = doc.data();
    return {
      uid: doc.id,
      email: d.email ?? "",
      displayName: d.displayName ?? d.email ?? doc.id,
    };
  });
}
