import { NextRequest, NextResponse } from 'next/server';
import { updateProduct, deleteProduct } from '../../../../../lib/products';
import { getCurrentUserFromRequest, isAdminUser } from '../../../../../lib/auth';
import { broadcastEvent } from '../../../../../lib/events';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user || !isAdminUser(user)) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const updated = await updateProduct(id, body);
    if (!updated) return NextResponse.json({ message: 'لم يتم العثور على المنتج' }, { status: 404 });

    try {
      await broadcastEvent({ type: 'products:updated', payload: { id, action: 'updated' } });
    } catch (e) {}

    return NextResponse.json({ message: 'تم تحديث المنتج', product: updated });
  } catch (err) {
    console.error('admin product PATCH error', err);
    return NextResponse.json({ message: 'خطأ في النظام' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user || !isAdminUser(user)) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
    }

    const { id } = await params;
    await deleteProduct(id);

    try {
      await broadcastEvent({ type: 'products:updated', payload: { id, action: 'deleted' } });
    } catch (e) {}

    return NextResponse.json({ message: 'تم حذف المنتج' });
  } catch (err) {
    console.error('admin product DELETE error', err);
    return NextResponse.json({ message: 'خطأ في النظام' }, { status: 500 });
  }
}

