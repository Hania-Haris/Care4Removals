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
 * Paginated, filterable lead list. Ordered by `createdAt` only (a single-field
 * index Firestore maintains automatically — no composite index to deploy);
 * status/source filters are applied in memory over a bounded fetch window.
 * Fine for this scale; if the collection ever grows large enough that the
 * over-fetch hurts, add the composite indexes in firestore.indexes.json and
 * push the filters back into the query.
 */
export async function listLeads(opts: {
  status?: LeadStatus;
  source?: LeadSource;
  cursor?: string;
}): Promise<LeadPage> {
  const db = getAdminDb();
  const filtered = !!(opts.status || opts.source);
  // Over-fetch when filtering so a page can still be filled.
  const fetchLimit = (filtered ? PAGE_SIZE * 6 : PAGE_SIZE) + 1;

  let q: FirebaseFirestore.Query = db
    .collection("leads")
    .orderBy("createdAt", "desc")
    .limit(fetchLimit);

  if (opts.cursor) {
    const cursorDoc = await db.collection("leads").doc(opts.cursor).get();
    if (cursorDoc.exists) q = q.startAfter(cursorDoc);
  }

  const snap = await q.get();
  let rows = snap.docs.map(mapDoc);
  if (opts.status) rows = rows.filter((r) => r.status === opts.status);
  if (opts.source) rows = rows.filter((r) => r.source === opts.source);

  const items = rows.slice(0, PAGE_SIZE);
  const hasMore = rows.length > PAGE_SIZE || snap.docs.length === fetchLimit;

  return {
    items,
    hasMore: hasMore && items.length > 0,
    nextCursor:
      hasMore && items.length > 0 ? items[items.length - 1]!.id : null,
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
  // Single equality filter (auto-indexed); entityType filter + ordering done
  // in memory — activities per entity are a small, bounded set.
  const snap = await getAdminDb()
    .collection("activities")
    .where("entityId", "==", leadId)
    .limit(200)
    .get();

  return snap.docs
    .map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        entityType: d.entityType ?? "",
        type: d.type ?? "",
        actor: d.actor ?? "system",
        metadata: d.metadata ?? {},
        createdAt: toIso(d.createdAt),
        _ts: d.createdAt?.toMillis?.() ?? 0,
      };
    })
    .filter((a) => a.entityType === "lead")
    .sort((a, b) => b._ts - a._ts)
    .map(({ _ts, entityType, ...rest }) => {
      void _ts;
      void entityType;
      return rest;
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
