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

function makeEmptyProduct(): Product {
  return { name: '', brand: '', price: 0, description: '', fragranceFamily: '', notes: {}, images: [], bestseller: false };
}

function extractTagsFromProduct(product: Product | null) {
  const t: string[] = [];
  if (product) {
    if (Array.isArray(product.tags)) t.push(...product.tags);
    if (product.notes && typeof product.notes === 'object') {
      Object.values(product.notes).forEach((arr) => arr.forEach((v) => t.push(v)));
    }
  }
  return Array.from(new Set(t));
}

export default function ProductEditorClient({ product, onSaved, onCancel }: { product: Product | null; onSaved: (p: Product, created?: boolean) => void; onCancel: () => void; }) {
  const [form, setForm] = useState<Product>(() => product || makeEmptyProduct());
  const [newNoteVal, setNewNoteVal] = useState('');
  const [tags, setTags] = useState<string[]>(() => extractTagsFromProduct(product));
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const inputClass = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100';

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const res = await fetch('/api/products/meta');
        const data = (await res.json()) as { categories?: string[] };
        setCategoryOptions(data.categories || []);
      } catch (err) {
        console.error('failed to load product meta', err);
      }
    };

    void loadMeta();
  }, []);

  function update<K extends keyof Product>(k: K, v: Product[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function addImage(url: string) {
    if (!url) return;
    setForm((f) => {
      const current = f.images || [];
      if (current.includes(url)) return f;
      return { ...f, images: [...current, url] };
    });
  }

  function setPrimaryImage(idx: number) {
    setForm((f) => {
      const images = [...(f.images || [])];
      if (images.length < 2) return f;
      const [selected] = images.splice(idx, 1);
      images.unshift(selected);
      return { ...f, images };
    });
  }

  function removeImage(idx: number) {
    setForm((f) => {
      const images = (f.images || []).filter((_, i) => i !== idx);
      return { ...f, images };
    });
  }


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

      const payload: Record<string, unknown> = { ...form };
      if (tags.length) payload.tags = tags;
      if (payload.discountPrice === '') {
        delete payload.discountPrice;
      }

      const method = form.id ? 'PUT' : 'POST';
      const url = form.id ? `/api/products/${form.id}` : '/api/products';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = (await res.json()) as { message?: string; product?: Product };
      if (!res.ok) throw new Error(data?.message || 'خطأ');
      onSaved(data.product || data, !form.id);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  }

  async function handleFilesUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadLoading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('file', f));
      const res = await fetch('/api/admin/products/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'خطأ');
      (data.urls || []).forEach((u: string) => addImage(u));
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء رفع الصور');
    } finally {
      setUploadLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">اسم العطر</label>
          <input className={inputClass} placeholder="اسم العطر" value={form.name || ''} onChange={(e) => update('name', e.target.value)} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">الماركة</label>
          <input className={inputClass} placeholder="الماركة" value={form.brand || ''} onChange={(e) => update('brand', e.target.value)} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">السعر</label>
          <input type="number" className={inputClass} placeholder="السعر" value={form.price ?? 0} onChange={(e) => update('price', Number(e.target.value))} />
        </div>
 
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">السعر قبل الخصم</label>
          <input type="number" className={inputClass} placeholder="سعر الخصم (اختياري)" value={form.discountPrice ?? ''} onChange={(e) => update('discountPrice', e.target.value === '' ? undefined : Number(e.target.value))} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-slate-700">الفئة / التصنيف</label>
          <input list="category-list" className={inputClass} placeholder="فئة/تصنيف أو اكتب جديدة" value={form.category || ''} onChange={(e) => update('category', e.target.value)} />
          <datalist id="category-list">
            {categoryOptions.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-slate-700">وصف المنتج</label>
          <textarea rows={4} className={`${inputClass} resize-none`} placeholder="اكتب وصف المنتج هنا..." value={form.description || ''} onChange={(e) => update('description', e.target.value)} />
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900">الصور</h3>
          <span className="text-xs font-bold text-slate-500">{(form.images || []).length} صورة</span>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <input placeholder="رابط الصورة (URL)" className={`${inputClass} flex-1`} id="img-url" />
          <button
            onClick={() => { const el = document.getElementById('img-url') as HTMLInputElement; addImage(el?.value || ''); if (el) el.value=''; }}
            className="rounded-full bg-emerald-500 px-4 py-3 text-sm font-black text-white shadow-md transition hover:bg-emerald-600"
          >
            إضافة رابط
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
            onDrop={async (e) => {
              e.preventDefault();
              setDragOver(false);
              const files = e.dataTransfer?.files;
              if (!files || files.length === 0) return;
              await handleFilesUpload(files);
            }}
            className={`flex-1 rounded-[22px] border-2 border-dashed p-5 text-center text-sm font-medium text-slate-500 transition ${dragOver ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}
          >
            اسحب وافلِت الصور هنا أو اخترها من الجهاز
            <input type="file" id="img-file" className="hidden" multiple accept="image/*" onChange={async (e) => { const files = e.target.files; if (files) await handleFilesUpload(files); }} />
          </div>

          <button
            onClick={async () => {
              const input = document.getElementById('img-file') as HTMLInputElement;
              if (!input) return;
              input.click();
            }}
            className="rounded-full bg-slate-900 px-4 py-3 text-sm font-black text-white shadow-md transition hover:bg-slate-800"
          >
            اختر من الجهاز
          </button>
        </div>

        {uploadLoading && <div className="mt-3 text-sm font-medium text-amber-600">جاري رفع الصور...</div>}

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {(form.images || []).map((im, i) => (
            <div key={`${im}-${i}`} className={`overflow-hidden rounded-2xl border bg-slate-50 p-2 shadow-sm ${i === 0 ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-200'}`}>
              <div className="h-24 overflow-hidden rounded-xl bg-white">
                <img src={im} alt="product" className="h-full w-full object-cover" />
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <button onClick={() => removeImage(i)} className="text-xs font-bold text-red-500">حذف</button>
                <button onClick={() => setPrimaryImage(i)} className="text-[10px] font-bold text-amber-700">
                  {i === 0 ? 'رئيسية' : 'تعيين رئيسية'}
                </button>
                <a href={im} target="_blank" rel="noreferrer" className="text-xs font-bold text-slate-600">فتح</a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-black text-slate-900">نغمات العطر</h3>

        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <input
            placeholder="أضف نغمة واضغط Enter أو ,"
            className={`${inputClass} flex-1`}
            value={newNoteVal}
            onChange={(e) => setNewNoteVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTagFromInput(); }
            }}
          />
          <button onClick={() => addTagFromInput()} className="rounded-full bg-emerald-500 px-4 py-3 text-sm font-black text-white shadow-md transition hover:bg-emerald-600">أضف</button>
        </div>

        <div className="mt-4 space-y-4">
          {tags.length > 0 && (
            <div>
              <div className="mb-2 text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">Tags</div>
              <div className="flex flex-wrap gap-2">
                {tags.map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
                    {t}
                    <button className="text-xs font-bold text-red-500" onClick={() => removeTag(i)}>x</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {Object.entries(form.notes || {}).map(([section, arr]) => (
            <div key={section}>
              <div className="mb-2 text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">{section}</div>
              <div className="flex flex-wrap gap-2">
                {arr.map((n, i) => (
                  <span key={i} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
        <label className="inline-flex items-center gap-3 text-sm font-bold text-slate-700">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-amber-500" checked={!!form.bestseller} onChange={(e) => update('bestseller', e.target.checked)} />
          Bestseller
        </label>
      </div>

      <div className="sticky bottom-0 z-10 mt-3 rounded-[22px] border border-slate-200 bg-white/90 p-3 shadow-[0_-10px_25px_rgba(15,23,42,0.05)] backdrop-blur-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button onClick={onCancel} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">إلغاء</button>
          <button onClick={save} disabled={loading} className="rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 px-6 py-3 text-sm font-black text-slate-900 shadow-[0_12px_25px_rgba(245,158,11,0.35)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? 'جاري الحفظ...' : 'حفظ المنتج'}
          </button>
        </div>
      </div>
    </div>
  );
}
