'use client';

import React, { useMemo, useState, useEffect } from 'react';
import ProductCard from '../../components/ProductCard';
import CartDrawer from '../../components/CartDrawer';
import { useCart } from '../../context/CartContext';

type ProductItem = {
  id?: string;
  name?: string;
  name_ar?: string;
  name_en?: string;
  category?: string;
  price?: number;
  fragranceFamily?: string;
  tags?: string[];
  notes?: Record<string, string[]>;
  volumes?: string[];
  images?: string[];
};

const normalizeProduct = (p: ProductItem) => ({
  ...p,
  id: p.id ?? String(p.name ?? 'product'),
  price: Number(p.price ?? 0),
  images: p.images ?? [],
});

export default function ProductsPage() {
  const [ALL_PRODUCTS, setAllProducts] = useState<ProductItem[]>([]);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | string>('all');
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [selectedVolumes, setSelectedVolumes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [sortBy, setSortBy] = useState('الأحدث');
  const { isCartOpen } = useCart();

  const [families, setFamilies] = useState<string[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const volumes = ['50ml', '100ml', '75ml', 'Sample'];
  const categoryOptions = [
    { label: 'جميع العطور', value: 'all' },
    { label: 'رجالية', value: 'men' },
    { label: 'نسائية', value: 'women' },
    { label: 'شرقية وعود', value: 'oriental' },
    { label: 'عينات وتجارب', value: 'samples' },
  ];

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/products', { cache: 'force-cache' });
        const data = await res.json();
        const prods = Array.isArray(data.products) ? (data.products as ProductItem[]) : [];
        setAllProducts(prods);

        const famSet = new Set<string>();
        const noteSet = new Set<string>();
        const categorySet = new Set<string>();
        prods.forEach((p) => {
          if (p.category) categorySet.add(String(p.category));
          if (p.fragranceFamily) famSet.add(p.fragranceFamily);
          if (Array.isArray(p.tags)) p.tags.forEach((t: string) => noteSet.add(t));
          if (p.notes && typeof p.notes === 'object') {
            const noteGroups = Object.values(p.notes) as string[][];
            noteGroups.forEach((arr) => arr.forEach((t) => noteSet.add(t)));
          }
        });

        setFamilies(Array.from(famSet));
        setNotes(Array.from(noteSet));
        setCategories(Array.from(categorySet));
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
    const q = query.trim().toLowerCase();

    return [...ALL_PRODUCTS]
      .filter((p) => {
        const searchTarget = `${p.name ?? p.name_ar ?? ''} ${p.name_en ?? ''}`.toLowerCase();
        const noteValues = Array.isArray(p.tags)
          ? (p.tags as string[])
          : (Object.values(p.notes ?? {}).flat() as string[]);

        if (q && !searchTarget.includes(q)) return false;
        if (selectedCategory !== 'all' && String(p.category ?? '') !== String(selectedCategory)) return false;
        if (selectedFamilies.length && !selectedFamilies.includes(p.fragranceFamily ?? '')) return false;
        if (selectedNotes.length && !selectedNotes.some((n) => noteValues.includes(n))) return false;
        if (selectedVolumes.length && !selectedVolumes.some((v) => (p.volumes ?? []).includes(v))) return false;
        const productPrice = Number(p.price ?? 0);
        if (productPrice < priceRange[0] || productPrice > priceRange[1]) return false;
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'الأعلى سعراً':
            return Number(b.price || 0) - Number(a.price || 0);
          case 'الأقل سعراً':
            return Number(a.price || 0) - Number(b.price || 0);
          default:
            return 0;
        }
      });
  }, [ALL_PRODUCTS, query, selectedCategory, selectedFamilies, selectedNotes, selectedVolumes, priceRange, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h4 className="mb-3 font-semibold">تصفية البحث</h4>

            <div className="mb-4">
              <label className="text-sm font-medium">التصنيف</label>
              <div className="mt-2 flex flex-col gap-2">
                <label className="text-sm">
                  <input
                    type="radio"
                    name="category-filter"
                    className="ml-2"
                    checked={selectedCategory === 'all'}
                    onChange={() => setSelectedCategory('all')}
                  />
                  جميع العطور
                </label>
                {categories.map((c) => (
                  <label key={c} className="text-sm">
                    <input
                      type="radio"
                      name="category-filter"
                      className="ml-2"
                      checked={selectedCategory === c}
                      onChange={() => setSelectedCategory(c)}
                    />
                    {c === 'men' ? 'رجالية' : c === 'women' ? 'نسائية' : c === 'oriental' ? 'شرقية وعود' : c === 'samples' ? 'عينات وتجارب' : c}
                  </label>
                ))}
              </div>
            </div>

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
              <button onClick={() => { setSelectedCategory('all'); setSelectedFamilies([]); setSelectedNotes([]); setSelectedVolumes([]); setPriceRange([0, 2000]); }} className="rounded bg-slate-100 px-3 py-2">مسح</button>
              <button onClick={() => {}} className="rounded bg-[#d4af37] px-3 py-2 text-white">تطبيق</button>
            </div>
          </div>
        </aside>

        <section>
          <div className="mb-4 overflow-x-auto pb-2">
            <div className="flex min-w-max gap-2">
              {categoryOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedCategory(option.value)}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
                    selectedCategory === option.value
                      ? 'border-[#d4af37] bg-[#d4af37] text-white shadow-sm'
                      : 'border-[#efe2c2] bg-white text-[#3a2b12] hover:border-[#d4af37] hover:text-[#8a5f00]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-3">
              <input placeholder="ابحث عن منتج" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full rounded border border-slate-200 px-3 py-2 focus:border-[#d4af37] focus:outline-none" />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded border border-slate-200 px-3 py-2 focus:border-[#d4af37] focus:outline-none">
                <option>الأحدث</option>
                <option>الأعلى سعراً</option>
                <option>الأقل سعراً</option>
              </select>
            </div>

            <div className="text-sm text-slate-500">عرض {filtered.length} نتائج</div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id ?? String(p.name ?? 'product')} product={normalizeProduct(p)} />
            ))}
          </div>
        </section>
      </div>

      {isCartOpen && <CartDrawer />}
    </div>
  );
}
