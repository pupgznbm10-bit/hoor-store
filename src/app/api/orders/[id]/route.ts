import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus } from '../../../../lib/orders';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const status = body?.status;

  if (!status || !['Pending', 'Shipped', 'Delivered'].includes(status)) {
    return NextResponse.json({ message: 'Invalid order status' }, { status: 400 });
  }

  const updated = await updateOrderStatus(id, status);
  if (!updated) {
    return NextResponse.json({ message: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ order: updated }, { status: 200 });
}
