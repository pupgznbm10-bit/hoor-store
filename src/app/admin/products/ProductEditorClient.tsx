'use client';
import React, { useEffect, useState } from 'react';

type NoteSections = { [section: string]: string[] };

type Product = {
  id?: string;
  name?: string;
  brand?: string;
  category?: string;
  price?: number;
  discountPrice?: number;
  description?: string;
  fragranceFamily?: string;
  notes?: NoteSections;
  tags?: string[];
  images?: string[];
  bestseller?: boolean;
};

export default function ProductEditorClient({ product, onSaved, onCancel }: { product: Product | null; onSaved: (p: Product, created?: boolean) => void; onCancel: () => void; }) {
  const [form, setForm] = useState<Product>(product || {
    name: '', brand: '', price: 0, description: '', fragranceFamily: '', notes: {}, images: [], bestseller: false,
  });
  const [newNoteKey, setNewNoteKey] = useState('');
  const [newNoteVal, setNewNoteVal] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(product || { name: '', brand: '', price: 0, description: '', fragranceFamily: '', notes: {}, images: [], bestseller: false });
    // populate tags from product.notes or product.tags
    const t: string[] = [];
    if (product) {
      if (Array.isArray(product.tags)) t.push(...product.tags);
      if (product.notes && typeof product.notes === 'object') Object.values(product.notes).forEach((arr) => arr.forEach((v) => t.push(v)));
    }
    setTags(Array.from(new Set(t)));
  }, [product]);

  function update<K extends keyof Product>(k: K, v: Product[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function addImage(url: string) {
    if (!url) return;
    setForm((f) => ({ ...f, images: [...(f.images || []), url] }));
  }

  function removeImage(idx: number) {
    setForm((f) => ({ ...f, images: (f.images || []).filter((_, i) => i !== idx) }));
  }

  function addNote() {
    if (!newNoteKey) return;
    setForm((f) => {
      const notes = { ...(f.notes || {}) } as NoteSections;
      notes[newNoteKey] = [...(notes[newNoteKey] || []), newNoteVal || ''];
      return { ...f, notes };
    });
    setNewNoteKey('');
    setNewNoteVal('');
  }

  function removeNote(section: string, idx: number) {
    setForm((f) => {
      const notes = { ...(f.notes || {}) } as NoteSections;
      notes[section] = notes[section].filter((_, i) => i !== idx);
      if (notes[section].length === 0) delete notes[section];
      return { ...f, notes };
    });
  }

  // tags management (simple free-form tags)
  function addTagFromInput(val?: string) {
    const v = (val || newNoteVal || '').trim();
    if (!v) return;
    setTags((t) => Array.from(new Set([...t, v])));
    setNewNoteVal('');
  }

  function removeTag(idx: number) {
    setTags((t) => t.filter((_, i) => i !== idx));
  }

  async function save() {
    setLoading(true);
    try {
      if (!form.name) {
        alert('الاسم مطلوب');
        setLoading(false);
        return;
      }
      // prepare payload: convert tags to product.tags and keep notes
      const payload: any = { ...form };
      if (tags && tags.length) payload.tags = tags;
      // if discountPrice is empty string convert to number or undefined
      if (payload.discountPrice === '') payload.discountPrice = undefined;

      const method = form.id ? 'PUT' : 'POST';
      const url = form.id ? `/api/products/${form.id}` : '/api/products';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'خطأ');
      onSaved(data.product || data, !form.id);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">{form.id ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input className="border p-2" placeholder="اسم العطر" value={form.name || ''} onChange={(e) => update('name', e.target.value)} />
        <input className="border p-2" placeholder="الماركة" value={form.brand || ''} onChange={(e) => update('brand', e.target.value)} />
        <input type="number" className="border p-2" placeholder="السعر" value={form.price as any || 0} onChange={(e) => update('price', Number(e.target.value))} />
        <input type="number" className="border p-2" placeholder="سعر الخصم (اختياري)" value={(form as any).discountPrice as any || ''} onChange={(e) => update('discountPrice' as any, e.target.value === '' ? '' : Number(e.target.value))} />
        <div>
          <input list="category-list" className="border p-2 w-full" placeholder="فئة/تصنيف أو اكتب جديدة" value={form.category || ''} onChange={(e) => update('category', e.target.value)} />
          <datalist id="category-list">
            {categoryOptions.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>
        <textarea className="border p-2 col-span-1 md:col-span-2" placeholder="الوصف" value={form.description || ''} onChange={(e) => update('description', e.target.value)} />
      </div>

      <div className="mt-4">
        <h3 className="font-semibold">الصور</h3>
        <div className="flex gap-2 items-center mt-2">
          <input placeholder="رابط الصورة (URL)" className="border p-2 flex-1" id="img-url" />
          <button onClick={() => { const el = document.getElementById('img-url') as HTMLInputElement; addImage(el?.value || ''); if (el) el.value=''; }} className="px-3 py-1 bg-green-500 text-white rounded">إضافة</button>
        </div>

        <div className="flex gap-2 items-center mt-3">
          <input type="file" id="img-file" className="border p-2" />
          <button onClick={async () => {
            const input = document.getElementById('img-file') as HTMLInputElement;
            if (!input?.files || input.files.length === 0) {
              alert('اختر ملفًا أولاً');
              return;
            }
            try {
              const fd = new FormData();
              Array.from(input.files).forEach((f) => fd.append('file', f));
              const res = await fetch('/api/admin/products/upload', { method: 'POST', body: fd });
              const data = await res.json();
              if (!res.ok) throw new Error(data?.message || 'خطأ');
              (data.urls || []).forEach((u: string) => addImage(u));
              input.value = '';
            } catch (err) {
              console.error(err);
              alert('حدث خطأ أثناء رفع الصور');
            }
          }} className="px-3 py-1 bg-indigo-600 text-white rounded">رفع ملف</button>
        </div>

        <div className="mt-2 flex gap-2 flex-wrap">
          {(form.images || []).map((im, i) => (
            <div key={i} className="w-28 border p-1 rounded">
              <img src={im} className="w-full h-16 object-cover rounded" />
              <div className="flex justify-between mt-1">
                <button onClick={() => removeImage(i)} className="text-xs text-red-600">حذف</button>
                <a href={im} target="_blank" rel="noreferrer" className="text-xs">فتح</a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold">نغمات العطر (notes)</h3>
        <div className="flex gap-2 mt-2">
          <input placeholder="القسم (top/heart/base أو اسم)" className="border p-2" value={newNoteKey} onChange={(e) => setNewNoteKey(e.target.value)} />
          <input placeholder="النغمة (مثال: ورد)" className="border p-2" value={newNoteVal} onChange={(e) => setNewNoteVal(e.target.value)} />
          <button onClick={addNote} className="px-3 py-1 bg-green-600 text-white rounded">إضافة نغمة</button>
        </div>

        <div className="mt-2">
          {Object.entries(form.notes || {}).map(([section, arr]) => (
            <div key={section} className="mt-2">
              <div className="font-semibold">{section}</div>
              <div className="flex gap-2 mt-1 flex-wrap">
                {arr.map((n, i) => (
                  <div key={i} className="bg-gray-100 px-2 py-1 rounded flex items-center gap-2">
                    <span>{n}</span>
                    <button className="text-red-500 text-xs" onClick={() => removeNote(section, i)}>x</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <label className="flex items-center gap-2"><input type="checkbox" checked={!!form