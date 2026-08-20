import { NextResponse } from 'next/server';
import { updateProduct, deleteProduct } from '../../../../../../lib/products';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const updated = await updateProduct(id, body);
    if (!updated) return NextResponse.json({ message: '«·„‰ Ã €Ì— „ÊÃÊœ' }, { status: 404 });
    return NextResponse.json({ message: ' „ «· ÕœÌÀ', product: updated });
  } catch (err) {
    console.error('admin product PATCH error', err);
    return NextResponse.json({ message: 'Œÿ√ ›Ì «·‰Ÿ«„' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await deleteProduct(id);
    return NextResponse.json({ message: ' „ «·Õ–›' });
  } catch (err) {
    console.error('admin product DELETE error', err);
    return NextResponse.json({ message: 'Œÿ√ ›Ì «·‰Ÿ«„' }, { status: 500 });
  }
}

