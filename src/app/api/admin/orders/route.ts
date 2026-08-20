import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '../../../../../lib/orders';
import { getCurrentUserFromRequest, isAdminUser } from '../../../../../lib/auth';
import { broadcastEvent } from '../../../../../lib/events';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user || !isAdminUser(user)) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
    }

    const body = await request.json();
    // expect body: fullName, phone, city, address, items, total, paymentMethod, status
    if (!body) return NextResponse.json({ message: 'Invalid body' }, { status: 400 });

    const created = await createOrder({
      fullName: String(body.fullName || '').trim(),
      phone: String(body.phone || '').trim(),
      city: String(body.city || '').trim(),
      address: String(body.address || '').trim(),
      items: Array.isArray(body.items) ? body.items : [],
      total: Number(body.total || 0),
      paymentMethod: String(body.paymentMethod || 'cod'),
      userId: body.userId || undefined,
      userEmail: body.userEmail || undefined,
      status: body.status || 'Pending',
    });

    try { await broadcastEvent({ type: 'orders:updated', payload: { id: created.id, action: 'created' } }); } catch (e) {}

    return NextResponse.json({ message: 'تم إنشاء الطلب', order: created }, { status: 201 });
  } catch (err) {
    console.error('admin create order error', err);
    return NextResponse.json({ message: 'خطأ في النظام' }, { status: 500 });
  }
}
