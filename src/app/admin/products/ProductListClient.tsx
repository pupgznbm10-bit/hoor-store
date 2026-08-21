'use client';
import React, { useEffect, useState } from 'react';

type Product = {
  id?: string;
  name?: string;
  brand?: string;
  category?: string;
  price?: number;
  discountPrice?: number;
  description?: string;
  fragranceFamily?: string;
  notes?: { [section: string]: string[] };
  tags?: string[];
  images?: string[];
  bestseller?: boolean;
};

import ProductEditorClient from './ProductEditorClient';
import ConfirmModal from '../../../components/ConfirmModal';

export default function ProductListClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (active) setProducts(data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadProducts();
    return () => { active = false; };
  }, []);

  function openNew() {
    setEditing(null);
    setShowEditor(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setShowEditor(true);
  }

  async function handleDelete(id: string) {
    setToDelete(id);
    setConfirmOpen(true);
  }

  async function onSaved(prod: Product, created = false) {
    setShowEditor(false);
    if (created) {
      setProducts((s) => [prod, ...s]);
    } else {
      setProducts((s) => s.map((p) => (p.id === prod.id ? prod : p)));
    }
    try { window.dispatchEvent(new CustomEvent('products:updated')); } catch {}
  }

  async function doConfirmDelete() {
    if (!toDelete) return;
    const id = toDelete;
    setConfirmOpen(false);
    setToDelete(null);
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (!res.ok) return alert('حدث خطأ أثناء الحذف');
    setProducts((s) => s.filter((x) => x.id !== id));
    try { window.dispatchEvent(new CustomEvent('products:updated')); } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.35em] text-amber-500 uppercase">Hoor Store</p>
          <h2 className="mt-2 text-2xl font-black text-slate-900">إدارة المنتجات</h2>
        </div>

        <button
          onClick={openNew}
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 px-5 py-3 text-sm font-black text-slate-900 shadow-[0_18px_35px_rgba(245,158,11,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(245,158,11,0.45)]"
        >
          + إضافة منتج جديد
        </button>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm">
        <div className="text-sm text-slate-500">
          {loading ? 'جاري تحميل المنتجات...' : `إجمالي المنتجات: ${products.length}`}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {products.map((p) => (
          <article
            key={p.id}
            className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_25px_50px_rgba(15,23,42,0.14)]"
          >
            <div className="absolute inset-x-8 top-0 h-24 rounded-full bg-gradient-to-r from-amber-200/40 via-yellow-100/30 to-transparent blur-2xl" />

            <div className="relative">
              <div className="overflow-hidden rounded-[22px] bg-slate-100">
                <img
                  src={p.images && p.images[0] ? p.images[0] : '/placeholder.png'}
                  alt={p.name || 'منتج'}
                  className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              {p.bestseller && (
                <span className="absolute right-3 top-3 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-bold text-slate-900 shadow-sm">
                  Bestseller
                </span>
              )}

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                    {p.category || 'عطر فاخر'}
                  </span>
                  <span className="text-xs font-bold text-emerald-600">{p.price || 0} ج.م</span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900">{p.name || 'اسم المنتج'}</h3>
                  <p className="mt-1 text-sm text-slate-500">{p.brand || 'Hoor'}</p>
                </div>

                <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                  {p.description ? p.description.slice(0, 110) : 'لا يوجد وصف مضاف حتى الآن.'}
                </p>

                <div className="flex items-center justify-between gap-2 pt-2">
                  <div className="flex items-center gap-2">
                    {p.discountPrice ? (
                      <>
                        <span className="text-xs text-slate-400 line-through">{p.discountPrice} ج.م</span>
                      </>
                    ) : null}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 px-4 py-2 text-xs font-black text-slate-900 shadow-md transition hover:scale-[1.02]"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => p.id && handleDelete(p.id)}
                      className="rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-4 py-2 text-xs font-black text-white shadow-md transition hover:scale-[1.02]"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {showEditor && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm md:p-6">
          <div className="mx-auto max-w-6xl rounded-[30px] border border-white/10 bg-[#f8fafc] shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 md:px-7">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.30em] text-amber-500 uppercase">Update Product</p>
                <h3 className="mt-1 text-xl font-black text-slate-900">
                  {editing ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                </h3>
              </div>
              <button
                onClick={() => setShowEditor(false)}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                إغلاق
              </button>
            </div>

            <div className="max-h-[80vh] overflow-y-auto px-4 py-5 md:px-7">
              <ProductEditorClient key={editing ? editing.id || 'new' : 'new'} product={editing} onSaved={onSaved} onCancel={() => setShowEditor(false)} />
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="تأكيد حذف المنتج"
        description="هل أنت متأكد أنك تريد حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء."
        onCancel={() => { setConfirmOpen(false); setToDelete(null); }}
        onConfirm={doConfirmDelete}
      />
    </div>
  );
}
