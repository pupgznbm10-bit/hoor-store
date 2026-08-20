import { NextResponse } from 'next/server';
import { readProducts } from '../../../../lib/products';

export async function GET() {
  try {
    const products = await readProducts();
    const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    const tagsSet = new Set<string>();
    products.forEach((p) => {
      if (Array.isArray(p.tags)) p.tags.forEach((t) => tagsSet.add(t));
      if (p.notes && typeof p.notes === 'object') Object.values(p.notes).forEach((arr) => arr.forEach((t) => tagsSet.add(t)));
    });
    const tags = Array.from(tagsSet);
    return NextResponse.json({ categories, tags });
  } catch (err) {
    console.error('products meta error', err);
    return NextResponse.json({ message: 'خطأ في النظام' }, { status: 500 });
  }
}
