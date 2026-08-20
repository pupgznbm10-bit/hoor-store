import { NextResponse } from 'next/server';
import { readProducts, createProduct } from '../../../../lib/products';

export async function GET() {
  try {
    const products = await readProducts();
    return NextResponse.json({ products });
  } catch (err) {
    console.error('products GET error', err);
    return NextResponse.json({ message: 'خطأ في النظام' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = await createProduct(body);
    return NextResponse.json({ message: 'تم إنشاء المنتج', product: created });
  } catch (err) {
    console.error('products POST error', err);
    return NextResponse.json({ message: 'خطأ في النظام' }, { status: 500 });
  }
}
