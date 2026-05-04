import { getCollection } from "@/lib/db";
import type { OrderItem, OrderStatus } from "@/types";
import type { ObjectId } from "mongodb";

export interface CreateOrderInput {
  userId:          string;
  userEmail:       string | null;
  userName:        string | null;
  items:           OrderItem[];
  subtotal:        number;
  discount:        number;
  discountPercent: number;
  total:           number;
  paystackReference: string;
  couponCode?:     string;
  // Persisted on the order for fulfilment + display
  // (kept as any here because DBOrder doesn't include address in this file yet)
  deliveryAddress?: any;
}

export interface DBOrder {
  _id?:            ObjectId;
  userId:          string;
  userEmail:       string | null;
  userName:        string | null;
  items:           OrderItem[];
  subtotal:        number;
  discount:        number;
  discountPercent: number;
  total:           number;
  couponCode?:     string;
  status:          OrderStatus;
  paystackReference: string;
  deliveryAddress?: any;
  paidAt?:         string;
  createdAt:       string;
  updatedAt:       string;
}

/** Shown in admin / revenue: Paystack success has been confirmed (not pending checkout or cancelled). */
export const ADMIN_VISIBLE_ORDER_STATUSES: OrderStatus[] = [
  "paid",
  "processing",
  "shipped",
  "delivered",
];

export async function createOrder(
  input: CreateOrderInput
): Promise<Omit<DBOrder, "_id"> & { _id: string }> {
  const orders = await getCollection<DBOrder>("orders");

  const now = new Date().toISOString();
  const doc: DBOrder = {
    ...input,
    // Remains pending until Paystack confirms payment (webhook or verify/confirm).
    status:    "pending",
    createdAt: now,
    updatedAt: now,
  };

  const result = await orders.insertOne(doc);

  return { ...doc, _id: String(result.insertedId) };
}

export async function getOrderById(id: string): Promise<DBOrder | null> {
  const { ObjectId } = await import("mongodb");
  const orders = await getCollection<DBOrder>("orders");
  try {
    return await orders.findOne({ _id: new ObjectId(id) }) as DBOrder | null;
  } catch {
    return null;
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  const { ObjectId } = await import("mongodb");
  const orders = await getCollection<DBOrder>("orders");
  await orders.updateOne(
    { _id: new ObjectId(orderId) },
    { $set: { status, updatedAt: new Date().toISOString() } }
  );
}

export async function findOrderByReference(reference: string): Promise<DBOrder | null> {
  const orders = await getCollection<DBOrder>("orders");
  return (await orders.findOne({ paystackReference: reference })) as DBOrder | null;
}

/** Remove checkout rows that never completed payment (only pending or cancelled). */
export async function deleteUnpaidOrderByReference(reference: string): Promise<boolean> {
  const orders = await getCollection<DBOrder>("orders");
  const res = await orders.deleteOne({
    paystackReference: reference,
    status: { $in: ["pending", "cancelled"] },
  } as any);
  return res.deletedCount > 0;
}

/**
 * Purge abandoned checkouts and failed-payment rows (cron / manual).
 * Does not remove cancelled orders that were paid then cancelled (have paidAt).
 */
export async function purgeStaleUnpaidOrders(pendingMaxAgeMs: number): Promise<{
  deletedStalePending: number;
  deletedUnpaidCancelled: number;
}> {
  const orders = await getCollection<DBOrder>("orders");
  const cutoff = new Date(Date.now() - pendingMaxAgeMs).toISOString();

  const stalePending = await orders.deleteMany({
    status: "pending",
    createdAt: { $lt: cutoff },
  } as any);

  const unpaidCancelled = await orders.deleteMany({
    status: "cancelled",
    $or: [{ paidAt: { $exists: false } }, { paidAt: null }],
    createdAt: { $lt: cutoff },
  } as any);

  return {
    deletedStalePending: stalePending.deletedCount,
    deletedUnpaidCancelled: unpaidCancelled.deletedCount,
  };
}

export async function getUserOrders(
  userId: string
): Promise<(Omit<DBOrder, "_id"> & { _id: string })[]> {
  const orders = await getCollection<DBOrder>("orders");
  const result = await orders
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();

  return result.map((o) => ({
    ...o,
    _id: String(o._id),
  })) as (Omit<DBOrder, "_id"> & { _id: string })[];
}

export async function getAdminOrderSummary() {
  const orders = await getCollection<DBOrder>("orders");
  const all = await orders
    .find({ status: { $in: ADMIN_VISIBLE_ORDER_STATUSES } } as any)
    .toArray();
  const totalRevenue = all.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const statusCounts: Record<OrderStatus, number> = {
    pending: 0,
    paid: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };
  for (const o of all) {
    const s = (o.status || "processing") as OrderStatus;
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  }
  return {
    totalOrders: all.length,
    totalRevenue,
    statusCounts,
  };
}