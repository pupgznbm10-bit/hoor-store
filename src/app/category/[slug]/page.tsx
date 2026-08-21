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

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const safeSlug = String(slug || 'men');
  const isBestseller = safeSlug === 'bestsellers';
  type CategoryProduct = {
    id: string;
    category?: string;
    bestseller?: boolean;
  };

  const productsList = (products as CategoryProduct[]).filter((product) => {
    if (isBestseller) return Boolean(product.bestseller);
    return product.category === safeSlug;
  });

  const meta = pageMeta[safeSlug] ?? pageMeta.men;

  const categoryColors: Record<string, string> = {
    men: 'from-[#111827] via-[#1f2937] to-[#d4af37]',
    women: 'from-[#b18e67] via-[#d9b58c] to-[#f3e7d8]',
    oriental: 'from-[#4b2e2d] via-[#7d4a3a] to-[#d4af37]',
    samples: 'from-[#1a1a1a] via-[#3b3b3b] to-[#c9a65d]',
  };

  const accent = categoryColors[safeSlug] ?? 'from-[#111827] via-[#1f2937] to-[#d4af37]';

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className={`relative overflow-hidden rounded-[32px] bg-gradient-to-br ${accent} px-6 py-8 text-white shadow-[0_20px_60px_rgba(15,23,42,0.15)] md:px-8`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_40%)]" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">التصنيف</p>
            <h1 className="mt-2 text-3xl font-black md:text-4xl">{meta.title}</h1>
            <p className="mt-2 max-w-xl text-sm text-white/80">{meta.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur-sm">{productsList.length} منتج</span>
            <Link href="/products" className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
              عرض جميع المنتجات
            </Link>
          </div>
        </div>
      </div>

      <div className="mb-8" />

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
