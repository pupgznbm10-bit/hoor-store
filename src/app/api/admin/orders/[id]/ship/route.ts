import { NextRequest, NextResponse } from 'next/server';
import { markOrderShipped } from '../../../../../../lib/orders';
import { getCurrentUserFromRequest, isAdminEmail } from '../../../../../../lib/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ message: 'غير مسموح' }, { status: 403 });
    }

    const body = await request.json();
    const estimate = String(body.estimate || '').trim();

    const updated = await markOrderShipped(id, estimate || undefined);
    if (!updated) return NextResponse.json({ message: 'الطلب غير موجود' }, { status: 404 });

    // Optionally: notify user via console/email
    console.log(`[Order] ${id} marked as Shipped, ETA: ${estimate}`);

    return NextResponse.json({ message: 'تم تمييز الطلب كشحن', order: updated });
  } catch (error) {
    console.error('admin ship order error', error);
    return NextResponse.json({ message: 'خطأ في النظام' }, { status: 500 });
  }
}
