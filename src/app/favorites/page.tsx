'use client';

import Link from 'next/link';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreProvider';
import products from '../../data/products.json';

export default function FavoritesPage() {
  const { wishlist, toggleWishlist } = useStore();
  const { addToCart } = useCart();
  const favoriteProducts = (products as any[]).filter((product) => wishlist.has(product.id));

  const handleMoveToCart = (product: any) => {
    addToCart({
      id: product.id,
      title: product.name,
      volume: product.volumes?.[0] ?? '50ml',
      price: product.price,
      quantity: 1,
      image: product.images?.[0],
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#a67c00]">المفضلة</p>
          <h1 className="mt-2 text-3xl font-black text-[#111827]">قائمة المفضلة</h1>
        </div>
        <Link href="/products" className="gold-btn inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white">
          <ShoppingBag size={16} />
          متابعة التسوق
        </Link>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#fff5d6] text-[#c79200]">
            <Heart className="h-9 w-9" fill="currentColor" />
          </div>
          <h2 className="text-2xl font-black text-[#111827]">لا يوجد عناصر مفضلة بعد</h2>
          <p className="mt-3 text-slate-600">احتفظ بالمنتجات التي تعجبك واحتفظ بها في قائمة المفضلة.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {favoriteProducts.map((product) => (
            <div key={product.id} className="overflow-hidden rounded-[26px] border border-[#efe5d4] bg-white shadow-[0_18px_45px_rgba(14,17,28,0.08)]">
              <div className="relative aspect-[4/5] overflow-hidden">
                <img src={product.images?.[0]} alt={product.name} className="h-full w-full object-cover" />
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-sm transition hover:scale-105"
                  aria-label="إزالة من المفضلة"
                >
                  <Heart size={18} fill="currentColor" />
                </button>
              </div>
              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-[#111827]">{product.name}</h3>
                    <p className="text-xs text-slate-500">{product.brand}</p>
                  </div>
                  <div className="text-left text-lg font-black text-[#111827]">{product.price.toLocaleString()} ج.م</div>
                </div>
                <p className="text-sm leading-6 text-slate-600">{product.description}</p>
                <div className="flex gap-3">
                  <button onClick={() => handleMoveToCart(product)} className="gold-btn flex-1 rounded-full px-4 py-3 text-sm font-bold text-white">
                    نقل إلى السلة
                  </button>
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:scale-[1.02]"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
