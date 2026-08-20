import { NextRequest, NextResponse } from 'next/server';
import { readProducts, createProduct } from '../../../../../lib/products';
import { getCurrentUserFromRequest, isAdminUser } from '../../../../../lib/auth';
import { broadcastEvent } from '../../../../../lib/events';

export async function GET(request: NextRequest) {
  try {
    const prods = await readProducts();
    return NextResponse.json({ products: prods });
  } catch (err) {
    console.error('admin products GET error', err);
    return NextResponse.json({ message: 'خطأ في النظام' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user || !isAdminUser(user)) return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
    const body = await request.json();

    const created = await createProduct(body);
    try { await broadcastEvent({ type: 'products:updated', payload: { id: created.id, action: 'created' } }); } catch(e){}
    return NextResponse.json({ message: 'تم إضافة المنتج', product: created });
  } catch (err) {
    console.error('admin products POST error', err);
    return NextResponse.json({ message: 'خطأ في النظام' }, { status: 500 });
  }
}
