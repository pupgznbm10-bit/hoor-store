'use client';
import React, { useEffect, useState } from 'react';

type Product = {
  id: string;
  name: string;
  brand?: string;
  price?: number;
  description?: string;
  fragranceFamily?: string;
  images?: string[];
  bestseller?: boolean;
};

import ProductEditorClient from './ProductEditorClient';

export default function ProductListClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
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
    if (!confirm('هل أنت متأكد من حذف المنتج؟')) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (!res.ok) alert('حدث خطأ أثناء الحذف');
    setProducts((s) => s.filter((x) => x.id !== id));
    // notify other parts of the app that products changed
    try { window.dispatchEvent(new CustomEvent('products:updated')); } catch(e){}
  }

  async function onSaved(prod: Product, created = false) {
    setShowEditor(false);
    if (created) {
      setProducts((s) => [prod, ...s]);
    } else {
      setProducts((s) => s.map((p) => (p.id === prod.id ? prod : p)));
    }
    try { window.dispatchEvent(new CustomEvent('products:updated')); } catch(e){}
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={openNew} className="px-4 py-2 bg-blue-600 text-white rounded">إضافة منتج</button>
        <div className="text-sm text-gray-600">{loading ? 'جاري التحميل...' : `${products.length} منتجات`}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} className="border rounded p-3 bg-white shadow-sm">
            <div className="flex space-x-3 rtl:space-x-reverse">
              <img src={p.images && p.images[0] ? p.images[0] : '/placeholder.png'} alt={p.name} className="w-20 h-20 object-cover rounded" />
              <div className="flex-1">
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-gray-500">{p.brand}</div>
                <div className="text-sm mt-2">{p.description ? p.description.slice(0, 80) : ''}</div>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => openEdit(p)} className="px-2 py-1 bg-yellow-400 rounded">تعديل</button>
                  <button onClick={() => handleDelete(p.id)} className="px-2 py-1 bg-red-500 text-white rounded">حذف</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showEditor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-3xl p-4 rounded shadow-lg">
            <button className="float-left text-sm" onClick={() => setShowEditor(false)}>إلغاء</button>
            <ProductEditorClient product={editing} onSaved={onSaved} onCancel={() => setShowEditor(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
