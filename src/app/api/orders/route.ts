import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromRequest } from '../../../lib/auth';
import { createOrder, readOrders } from '../../../lib/orders';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const me = searchParams.get('me');

  if (me === '1') {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ orders: [] }, { status: 401 });
    }

    const allOrders = await readOrders();
    const userEmail = user.email.toLowerCase();
    const userOrders = allOrders
      .filter((order) => order.userId === user.id || (!order.userId && order.userEmail?.toLowerCase() === userEmail))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return NextResponse.json({ orders: userOrders }, { status: 200 });
  }

  const orders = await readOrders();
  return NextResponse.json({ orders }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }

  const user = await getCurrentUserFromRequest(request);
  const fullName = String(body.fullName || user?.fullName || '').trim();
  const phone = String(body.phone || user?.phone || '').trim();
  const city = String(body.city || '').trim();
  const address = String(body.address || '').trim();
  const paymentMethod = String(body.paymentMethod || 'cod');
  const total = Number(body.total || 0);
  const items = Array.isArray(body.items) ? body.items : [];

  const missingFields: string[] = [];
  if (!fullName) missingFields.push('الاسم الكامل');
  if (!phone) missingFields.push('رقم الهاتف');
  if (!city) missingFields.push('المدينة');
  if (!address) missingFields.push('العنوان');
  if (!items.length) missingFields.push('العناصر');
  if (!total) missingFields.push('المجموع');

  if (missingFields.length) {
    const message = `الرجاء إدخال الحقول التالية: ${missingFields.join('، ')}`;
    return NextResponse.json({ message }, { status: 400 });
  }

  const created = await createOrder({
    userId: user?.id,
    userEmail: user?.email || body.userEmail,
    fullName,
    phone,
    city,
    address,
    total,
    paymentMethod,
    items,
  });

  return NextResponse.json({ order: created }, { status: 201 });
}
