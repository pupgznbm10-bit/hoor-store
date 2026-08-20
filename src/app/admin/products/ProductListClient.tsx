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
import ConfirmModal from '../../../components/ConfirmModal';
import DraggableModal from '../../../components/DraggableModal';

export default function ProductListClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);

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
    // open confirm modal
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
    try { window.dispatchEvent(new CustomEvent('products:updated')); } catch(e){}
  }

  async function doConfirmDelete() {
    if (!toDelete) return;
    const id = toDelete;
    setConfirmOpen(false);
    setToDelete(null);
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (!res.ok) return alert('حدث خطأ أثناء الحذف');
    setProducts((s) => s.filter((x) => x.id !== id));
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
        <DraggableModal onClose={() => setShowEditor(false)}>
          <div className="p-2 flex justify-end">
            <button className="text-sm" onClick={() => setShowEditor(false)}>إلغاء</button>
          </div>
          <ProductEditorClient product={editing} onSaved={onSaved} onCancel={() => setShowEditor(false)} />
        </DraggableModal>
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
