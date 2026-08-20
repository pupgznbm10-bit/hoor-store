'use client';

import Link from 'next/link';
import ProductCard from '../../../components/ProductCard';
import products from '../../../data/products.json';

const pageMeta: Record<string, { title: string; description: string }> = {
  men: { title: 'عطور رجالية', description: 'رائحة أنيقة وقوية تناسب كل يوم' },
  women: { title: 'عطور نسائية', description: 'مزيج من الزهور واللمسات الفاخرة' },
  oriental: { title: 'عطور شرقية وعود', description: 'روائح غنية وعميقة مع لمسات دخانية' },
  samples: { title: 'عينات وتجارب', description: 'اكتشف الروائح قبل شراء النسخة الكاملة' },
  bestsellers: { title: 'الأكثر مبيعاً', description: 'الأكثر طلباً في متجر حور' },
};

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const slug = params?.slug ?? 'men';
  const isBestseller = slug === 'bestsellers';
  const productsList = (products as any[]).filter((product) => {
    if (isBestseller) return Boolean(product.bestseller);
    return product.category === slug;
  });

  const meta = pageMeta[slug] ?? pageMeta.men;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-[#a67c00]">التصنيف</p>
          <h1 className="mt-2 text-3xl font-black text-[#111827]">{meta.title}</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600">{meta.description}</p>
        </div>
        <Link href="/products" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#111827] transition hover:scale-[1.02] hover:border-[#d4af37] hover:text-[#a67c00]">
          عرض جميع المنتجات
        </Link>
      </div>

      {productsList.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <h2 className="text-2xl font-black text-[#111827]">لا توجد منتجات في هذا التصنيف حالياً</h2>
          <p className="mt-3 text-slate-600">جرّب تصنيفاً آخر أو عد إلى الصفحة الرئيسية.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {productsList.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
