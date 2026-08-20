import { NextResponse } from 'next/server';
import { readProducts, createProduct } from '../../../../../lib/products';

export async function GET(request: Request) {
  try {
    const prods = await readProducts();
    return NextResponse.json({ products: prods });
  } catch (err) {
    console.error('admin products GET error', err);
    return NextResponse.json({ message: 'خطأ في النظام' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const created = await createProduct(body);
    return NextResponse.json({ message: 'تم إضافة المنتج', product: created });
  } catch (err) {
    console.error('admin products POST error', err);
    return NextResponse.json({ message: 'خطأ في النظام' }, { status: 500 });
  }
}
