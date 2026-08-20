import { NextRequest, NextResponse } from 'next/server';
import { markOrderDelivered, readOrders } from '../../../../../lib/orders';
import { getCurrentUserFromRequest } from '../../../../../lib/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) return NextResponse.json({ message: 'غير مسموح' }, { status: 401 });
    const orders = await readOrders();
    const order = orders.find((o) => o.id === id);
    if (!order) return NextResponse.json({ message: 'الطلب غير موجود' }, { status: 404 });

    // ensure the current user owns this order (by email or userId)
    if (order.userId && order.userId !== user.id) return NextResponse.json({ message: 'غير مسموح' }, { status: 403 });
    if (!order.userId && order.userEmail && order.userEmail.toLowerCase() !== user.email.toLowerCase()) return NextResponse.json({ message: 'غير مسموح' }, { status: 403 });

    const updated = await markOrderDelivered(id);
    if (!updated) return NextResponse.json({ message: 'فشل تحديث حالة الطلب' }, { status: 500 });

    console.log(`[Order] ${id} marked as Delivered by user ${user.email}`);

    return NextResponse.json({ message: 'تم تأكيد استلام الطلب. شكراً لك!', order: updated });
  } catch (error) {
    console.error('confirm-delivered error', error);
    return NextResponse.json({ message: 'خطأ في النظام' }, { status: 500 });
  }
}
