'use client';

import React, { useState } from 'react';
import { useCart } from '../../../context/CartContext';
import products from '../../../data/products.json';

export default function ProductDetails({ params }: { params: { id: string } }) {
  const id = params.id;
  const product = (products as any[]).find((item) => item.id === id);
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVolume, setSelectedVolume] = useState(product?.volumes?.[0] ?? '50ml');
  const [qty, setQty] = useState(1);

  if (!product) return <div className="p-8 text-center text-slate-500">المنتج غير موجود</div>;

  const noteSections = {
    top: product.notes?.top ?? (Array.isArray(product.notes) ? product.notes.slice(0, 2) : []),
    heart: product.notes?.heart ?? (Array.isArray(product.notes) ? product.notes.slice(2, 4) : []),
    base: product.notes?.base ?? (Array.isArray(product.notes) ? product.notes.slice(4, 6) : []),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-[28px] bg-slate-50">
            <div className="relative aspect-[4/3]">
              <img src={product.images[selectedImage]} alt={product.name} className="h-full w-full object-cover" />
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            {product.images.map((img: string, idx: number) => (
              <button key={img} onClick={() => setSelectedImage(idx)} className={`h-20 w-20 overflow-hidden rounded-2xl border ${idx === selectedImage ? 'border-[#d4af37] ring-2 ring-[#d4af37]/30' : 'border-slate-200'}`}>
                <img src={img} alt={`${product.name} ${idx}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-[#a67c00]">منتج فاخر</p>
          <h1 className="mt-2 text-3xl font-black text-[#111827]">{product.name}</h1>
          <p className="mt-2 text-sm text-slate-500">{product.brand}</p>
          <p className="mt-4 text-sm leading-7 text-slate-600">{product.description}</p>

          <div className="mt-6 rounded-[24px] bg-white p-4 shadow-sm">
            <h4 className="mb-3 text-lg font-black text-[#111827]">هرم الرائحة</h4>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {[
                ['الافتتاحية', noteSections.top],
                ['قلب العطر', noteSections.heart],
                ['قاعدة العطر', noteSections.base],
              ].map(([label, notes]) => (
                <div key={label as string}>
                  <div className="text-xs text-slate-400">{label}</div>
                  <ul className="mt-2 space-y-1 text-slate-600">
                    {(notes as string[]).map((n: string) => <li key={n}>{n}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
                <span>الثبات</span>
                <span className="font-bold text-[#111827]">{product.rating}/5</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-[#d4af37]" style={{ width: `${(product.rating / 5) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 overflow-hidden rounded-full border border-slate-200 bg-white">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-xl text-slate-700">-</button>
              <div className="min-w-8 text-center font-bold text-[#111827]">{qty}</div>
              <button onClick={() => setQty(qty + 1)} className="px-3 py-2 text-xl text-slate-700">+</button>
            </div>

            <div className="text-2xl font-black text-[#111827]">{product.price.toLocaleString()} ج.م</div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {(product.volumes ?? ['50ml']).map((v: string) => (
              <button key={v} onClick={() => setSelectedVolume(v)} className={`rounded-full px-4 py-2 text-sm font-bold ${selectedVolume === v ? 'bg-[#d4af37] text-white' : 'bg-slate-100 text-slate-700'}`}>
                {v}
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => addToCart({ id: product.id, title: product.name, price: product.price, quantity: qty, volume: selectedVolume, image: product.images[0] })} className="rounded-full bg-[#d4af37] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#c79d1e]">إضافة إلى السلة</button>
            <button onClick={() => addToCart({ id: product.id, title: product.name, price: product.price, quantity: qty, volume: selectedVolume, image: product.images[0] })} className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700">شراء الآن</button>
          </div>
        </div>
      </div>
    </div>
  );
}
