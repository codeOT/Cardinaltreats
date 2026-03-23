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
  createdAt:       string;
  updatedAt:       string;
}

export async function createOrder(input: CreateOrderInput): Promise<DBOrder & { _id: string }> {
  const orders = await getCollection<DBOrder>("orders");

  const now = new Date().toISOString();
  const doc: DBOrder = {
    ...input,
    // Default to processing so UI shows the correct badge immediately.
    status:    "processing",
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

export async function getUserOrders(userId: string): Promise<(DBOrder & { _id: string })[]> {
  const orders = await getCollection<DBOrder>("orders");
  const result = await orders
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();

  return result.map((o) => ({
    ...o,
    _id: String(o._id),
  })) as (DBOrder & { _id: string })[];
}