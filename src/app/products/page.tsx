'use client';

import React, { useMemo, useState, useEffect } from 'react';
import ProductCard from '../../components/ProductCard';
import CartDrawer from '../../components/CartDrawer';
import { useCart } from '../../context/CartContext';

export default function ProductsPage() {
  const [ALL_PRODUCTS, setAllProducts] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [selectedVolumes, setSelectedVolumes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [sortBy, setSortBy] = useState('الأحدث');
  const { isCartOpen } = useCart();

  const [families, setFamilies] = useState<string[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [volumes, setVolumes] = useState<string[]>(['50ml', '100ml', '75ml', 'Sample']);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        const prods = data.products || [];
        setAllProducts(prods);
        // derive families and notes
        const famSet = new Set<string>();
        const noteSet = new Set<string>();
        prods.forEach((p: any) => {
          if (p.fragranceFamily) famSet.add(p.fragranceFamily);
          if (Array.isArray(p.tags)) p.tags.forEach((t: string) => noteSet.add(t));
          if (p.notes && typeof p.notes === 'object') Object.values(p.notes).forEach((arr: string[]) => arr.forEach((t) => noteSet.add(t)));
        });
        setFamilies(Array.from(famSet));
        setNotes(Array.from(noteSet));
      } catch (err) {
        console.error('failed to load products', err);
      }
    }
    load();
    const handler = () => load();
    window.addEventListener('products:updated', handler);
    return () => window.removeEventListener('products:updated', handler);
  }, []);

  const filtered = useMemo(() => {
    return ALL_PRODUCTS.filter((p) => {
      const searchTarget = `${p.name ?? p.name_ar ?? ''} ${p.name_en ?? ''}`.toLowerCase();
      const noteValues = Array.isArray(p.tags)
        ? p.tags
        : Object.values(p.notes ?? {}).flat();

      if (query && !searchTarget.includes(query.toLowerCase())) return false;
      if (selectedFamilies.length && !selectedFamilies.includes(p.fragranceFamily ?? '')) return false;
      if (selectedNotes.length && !selectedNotes.some((n) => noteValues.includes(n))) return false;
      if (selectedVolumes.length && !selectedVolumes.some((v) => (p.volumes ?? []).includes(v))) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'الأعلى سعراً':
          return b.price - a.price;
        case 'الأقل سعراً':
          return a.price - b.price;
        default:
          return 0;
      }
    });
  }, [ALL_PRODUCTS, query, selectedFamilies, selectedNotes, selectedVolumes, priceRange, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h4 className="mb-3 font-semibold">تصفية البحث</h4>

            <div className="mb-4">
              <label className="text-sm font-medium">العائلة العطرية</label>
              <div className="mt-2 flex flex-col gap-2">
                {families.map((f) => (
                  <label key={f} className="text-sm">
                    <input
                      type="checkbox"
                      className="ml-2"
                      checked={selectedFamilies.includes(f)}
                      onChange={(e) =>
                        setSelectedFamilies((prev) => (e.target.checked ? [...prev, f] : prev.filter((x) => x !== f)))
                      }
                    />
                    {f}
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium">المكونات الأساسية</label>
              <div className="mt-2 flex flex-col gap-2">
                {notes.map((n) => (
                  <label key={n} className="text-sm">
                    <input
                      type="checkbox"
                      className="ml-2"
                      checked={selectedNotes.includes(n)}
                      onChange={(e) => setSelectedNotes((prev) => (e.target.checked ? [...prev, n] : prev.filter((x) => x !== n)))}
                    />
                    {n}
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium">الحجم</label>
              <div className="mt-2 flex flex-col gap-2">
                {volumes.map((v) => (
                  <label key={v} className="text-sm">
                    <input
                      type="checkbox"
                      className="ml-2"
                      checked={selectedVolumes.includes(v)}
                      onChange={(e) => setSelectedVolumes((prev) => (e.target.checked ? [...prev, v] : prev.filter((x) => x !== v)))}
                    />
                    {v}
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium">نطاق السعر</label>
              <div className="mt-2 flex items-center gap-3">
                <input type="number" value={priceRange[0]} onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])} className="w-1/2 rounded border px-2 py-1" />
                <input type="number" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} className="w-1/2 rounded border px-2 py-1" />
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button onClick={() => { setSelectedFamilies([]); setSelectedNotes([]); setSelectedVolumes([]); setPriceRange([0, 2000]); }} className="rounded bg-slate-100 px-3 py-2">مسح</button>
              <button onClick={() => {}} className="rounded bg-[#d4af37] px-3 py-2 text-white">تطبيق</button>
            </div>
          </div>
        </aside>

        <section>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input placeholder="ابحث عن منتج" value={query} onChange={(e) => setQuery(e.target.value)} className="rounded border px-3 py-2" />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded border px-3 py-2">
                <option>الأحدث</option>
                <option>الأعلى سعراً</option>
                <option>الأقل سعراً</option>
              </select>
            </div>

            <div className="text-sm text-slate-500">عرض {filtered.length} نتائج</div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>

      {isCartOpen && <CartDrawer />}
    </div>
  );
}
