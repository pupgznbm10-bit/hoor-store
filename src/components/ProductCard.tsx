'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Plus, ArrowLeft } from 'lucide-react';
import { useStore } from '../context/StoreProvider';
import { useCart } from '../context/CartContext';

export type Product = {
  id: string;
  name_ar?: string;
  name?: string;
  name_en?: string;
  images: string[];
  price: number;
  originalPrice?: number;
  fragranceFamily?: string;
  notes?: string[] | Record<string, string[]>;
  volumes?: string[];
  bestseller?: boolean;
};

export default function ProductCard({ product }: { product: Product }) {
  const { toggleWishlist, isWishlisted } = useStore();
  const { addToCart } = useCart();

  const productName = product.name_ar || product.name || 'Perfume';
  const primaryImage = product.images?.[0] ?? '/placeholder.png';
  const hoverImage = product.images?.[1] ?? primaryImage;

  const noteSummary = Array.isArray(product.notes)
    ? product.notes
    : product.notes && typeof product.notes === 'object'
      ? Object.values(product.notes).flat().slice(0, 3)
      : [];

  const handleQuickAdd = (volume?: string) => {
    addToCart({
      id: product.id,
      title: productName,
      price: product.price,
      quantity: 1,
      volume: volume ?? product.volumes?.[0] ?? '50ml',
      image: primaryImage,
    });
  };

  const fallbackImage = '/placeholder.png';

  return (
    <article className="product-card-motion group overflow-hidden rounded-[20px] border border-[#efe5d4] bg-white shadow-[0_20px_45px_rgba(14,17,28,0.08)] sm:rounded-[26px]">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#f6f0e7]">
        <Link href={`/products/${product.id}`} className="block h-full w-full">
          <img
            src={primaryImage}
            alt={productName}
            loading="lazy"
            decoding="async"
            sizes="(max-width: 768px) 100vw, 25vw"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallbackImage; }}
            className="product-card-image h-full w-full object-cover group-hover:opacity-0"
          />
          <img
            src={hoverImage}
            alt={`${productName} hover`}
            loading="lazy"
            decoding="async"
            sizes="(max-width: 768px) 100vw, 25vw"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallbackImage; }}
            className="product-card-image absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100"
          />
        </Link>

        <div className="absolute inset-x-3 top-3 flex items-start justify-between">
          <div className="flex flex-col gap-2">
            {product.originalPrice && (
              <span className="rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">تخفيض</span>
            )}
            {product.fragranceFamily && (
              <span className="rounded-full bg-[#111827]/70 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">{product.fragranceFamily}</span>
            )}
          </div>
          <button
            onClick={() => toggleWishlist(product.id)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/85 text-[#1d1d1d] shadow-sm backdrop-blur-sm transition"
            aria-label="إضافة إلى المفضلة"
          >
            <Heart size={15} className={isWishlisted(product.id) ? 'fill-red-500 text-red-500' : ''} />
          </button>
        </div>

        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 opacity-0 transition duration-300 group-hover:opacity-100">
          <div className="flex flex-wrap gap-2">
            {product.volumes?.slice(0, 2).map((v) => (
              <button
                key={v}
                onClick={() => handleQuickAdd(v)}
                className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium text-[#1a1a1a] shadow-sm transition"
              >
                {v}
              </button>
            ))}
          </div>
          <button
            onClick={() => handleQuickAdd(product.volumes?.[0])}
            className="flex items-center gap-2 rounded-full bg-[#d4af37] px-3 py-2 text-sm font-bold text-white shadow-md transition"
          >
            <Plus size={14} />
            إضافة
          </button>
        </div>
      </div>

      <div className="space-y-2 p-3 sm:space-y-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href={`/products/${product.id}`} className="text-sm font-bold text-[#171717] hover:text-[#a67c00] transition sm:text-base">
              {productName}
            </Link>
            {product.name_en && <p className="text-xs text-[#6b7280]">{product.name_en}</p>}
          </div>
          <div className="text-left">
            <div className="text-sm font-black text-[#111827] gold-text-gradient sm:text-base">{product.price.toLocaleString()} ج.م</div>
            {product.originalPrice && (
              <div className="text-[11px] text-slate-400 line-through">{product.originalPrice.toLocaleString()} ج.م</div>
            )}
          </div>
        </div>

        {noteSummary.length > 0 && (
          <div className="text-xs leading-6 text-slate-500">
            <span className="font-semibold text-slate-700">نغمات:</span> {noteSummary.join('، ')}
          </div>
        )}

        <Link
          href={`/products/${product.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#865b10] hover:text-[#6b4a00] transition"
        >
          تفاصيل المنتج
          <ArrowLeft size={14} />
        </Link>
      </div>
    </article>
  );
}
