import { NextResponse } from 'next/server';
import { readProducts, updateProduct, deleteProduct } from '../../../../lib/products';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const products = await readProducts();
    const p = products.find((x) => x.id === id);
    if (!p) return NextResponse.json({ message: 'ÇáãäÊÌ ÛíÑ ãæÌæÏ' }, { status: 404 });
    return NextResponse.json({ product: p });
  } catch (err) {
    console.error('products GET by id error', err);
    return NextResponse.json({ message: 'ÎØÃ İí ÇáäÙÇã' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const updated = await updateProduct(id, body);
    if (!updated) return NextResponse.json({ message: 'ÇáãäÊÌ ÛíÑ ãæÌæÏ' }, { status: 404 });
    return NextResponse.json({ message: 'Êã ÇáÊÍÏíË', product: updated });
  } catch (err) {
    console.error('products PUT error', err);
    return NextResponse.json({ message: 'ÎØÃ İí ÇáäÙÇã' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await deleteProduct(id);
    return NextResponse.json({ message: 'Êã ÇáÍĞİ' });
  } catch (err) {
    console.error('products DELETE error', err);
    return NextResponse.json({ message: 'ÎØÃ İí ÇáäÙÇã' }, { status: 500 });
  }
}
