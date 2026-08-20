'use client';
import React, { useEffect, useState } from 'react';

type Product = { id: string; name: string; price: number; images?: string[] };

type OrderItem = { productId: string; title: string; price: number; quantity: number };

export default function OrderCreatorClient({ onClose, onCreated }: { onClose: () => void; onCreated?: (order: any) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [status, setStatus] = useState<'Pending' | 'Shipped' | 'Delivered'>('Pending');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  function addSelected() {
    if (!selectedId) return;
    const p = products.find((x) => x.id === selectedId);
    if (!p) return;
    setItems((s) => {
      const existing = s.find((it) => it.productId === p.id);
      if (existing) return s.map((it) => it.productId === p.id ? { ...it, quantity: it.quantity + 1 } : it);
      return [...s, { productId: p.id, title: p.name, price: p.price, quantity: 1 }];
    });
  }

  function updateQuantity(idx: number, q: number) {
    setItems((s) => s.map((it, i) => i === idx ? { ...it, quantity: q } : it));
  }

  function removeItem(idx: number) {
    setItems((s) => s.filter((_, i) => i !== idx));
  }

  const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

  async function createOrder() {
    if (!fullName || !phone || !city || !address || items.length === 0) { alert('املأ الحقول المطلوبة واختر منتج واحد على الأقل'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName, phone, city, address, items, total, paymentMethod, status }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'خطأ');
      try { window.dispatchEvent(new CustomEvent('orders:updated')); } catch(e){}
      onCreated?.(data.order);
      onClose();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء إنشاء الطلب');
    } finally { setLoading(false); }
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-3">إضافة طلب جديد</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input placeholder="اسم العميل" className="border p-2" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <input placeholder="الهاتف" className="border p-2" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input placeholder="المدينة" className="border p-2" value={city} onChange={(e) => setCity(e.target.value)} />
        <input placeholder="العنوان" className="border p-2" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>

      <div className="mt-3">
        <label className="text-sm">اختر منتجًا</label>
        <div className="flex gap-2 mt-2">
          <select value={selectedId ?? ''} onChange={(e) => setSelectedId(e.target.value || null)} className="border p-2 flex-1">
            <option value="">-- اختر --</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name} - {p.price} ج.م</option>)}
          </select>
          <button onClick={addSelected} className="px-3 py-2 bg-green-600 text-white rounded">أضف</button>
        </div>

        <div className="mt-3">
          {items.map((it, i) => (
            <div key={it.productId} className="flex items-center gap-2 mb-2">
              <div className="flex-1">{it.title}</div>
              <input type="number" value={it.quantity} min={1} onChange={(e) => updateQuantity(i, Number(e.target.value))} className="w-20 border p-1" />
              <div className="w-24 text-right">{(it.price * it.quantity).toLocaleString()} ج.م</div>
              <button onClick={() => removeItem(i)} className="text-red-600">حذف</button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="border p-2">
          <option value="cod">الدفع عند الاستلام</option>
          <option value="card">دفع الكارت</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="border p-2">
          <option value="Pending">قيد التنفيذ</option>
          <option value="Shipped">تم الشحن</option>
          <option value="Delivered">تم التوصيل</option>
        </select>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="font-bold">المجموع: {total.toLocaleString()} ج.م</div>
        <div className="flex gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">إلغاء</button>
          <button onClick={createOrder} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'جاري الإنشاء...' : 'إنشاء الطلب'}</button>
        </div>
      </div>
    </div>
  );
}
