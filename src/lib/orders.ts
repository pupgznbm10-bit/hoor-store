import fs from 'fs/promises';
import path from 'path';

export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered';

export type OrderItem = {
  title: string;
  price: number;
  quantity: number;
  volume?: string;
};

export type OrderRecord = {
  id: string;
  userId?: string;
  userEmail?: string;
  fullName: string;
  phone: string;
  city: string;
  address: string;
  total: number;
  paymentMethod: string;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  // Optional shipping/delivery metadata
  deliveryEstimate?: string; // e.g. "2 days" or "3 hours"
  shippedAt?: string;
  deliveredAt?: string;
  revenueReleased?: boolean;
};

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'orders.json');

async function ensureDataFile() {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, '[]', 'utf-8');
  }
}

export async function readOrders(): Promise<OrderRecord[]> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  const cleaned = raw.replace(/^\uFEFF/, '');
  const parsed = cleaned ? JSON.parse(cleaned) : [];
  return Array.isArray(parsed) ? parsed : [];
}

export async function writeOrders(orders: OrderRecord[]) {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(orders, null, 2), 'utf-8');
}

export async function getOrdersForUser(userId: string) {
  const orders = await readOrders();
  return orders.filter((order) => order.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createOrder(input: Omit<OrderRecord, 'id' | 'status' | 'createdAt' | 'updatedAt'> & { status?: OrderStatus }) {
  const orders = await readOrders();
  const now = new Date().toISOString();
  const order: OrderRecord = {
    id: `HO-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    ...input,
    status: input.status ?? 'Pending',
    createdAt: now,
    updatedAt: now,
  };

  orders.unshift(order);
  await writeOrders(orders);
  return order;
}

export async function markOrderShipped(id: string, estimate?: string) {
  const orders = await readOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;
  orders[index] = {
    ...orders[index],
    status: 'Shipped',
    deliveryEstimate: estimate || orders[index].deliveryEstimate,
    shippedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await writeOrders(orders);
  return orders[index];
}

export async function markOrderDelivered(id: string) {
  const orders = await readOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;
  orders[index] = {
    ...orders[index],
    status: 'Delivered',
    deliveredAt: new Date().toISOString(),
    revenueReleased: true,
    updatedAt: new Date().toISOString(),
  };
  await writeOrders(orders);
  return orders[index];
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const orders = await readOrders();
  const index = orders.findIndex((order) => order.id === id);
  if (index === -1) return null;

  orders[index] = { ...orders[index], status, updatedAt: new Date().toISOString() };
  await writeOrders(orders);
  return orders[index];
}
