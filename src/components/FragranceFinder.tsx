'use client';

import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const OPTIONS = {
  scentTypes: ['عود وعنبر', 'أزهار وورود', 'منعش وسيتراس', 'خشبي دافئ'],
  occasion: ['يومي للعمل', 'مناسبات ورسميات', 'سهرات وليالي خاصة'],
  intensity: ['هادئ وناعم', 'متوسط', 'قوي وشديد الفوحان'],
};

const RECOMMENDATIONS: Record<string, any[]> = {
  'عود وعنبر|يومي للعمل|هادئ وناعم': [
    { id: 'p-001', title: 'عود الملكي - 50ml', price: 1200, image: '/images/p-001-1.jpg' },
  ],
  'أزهار وورود|مناسبات ورسميات|قوي وشديد الفوحان': [
    { id: 'p-002', title: 'زهرة الفجر - 100ml', price: 950, image: '/images/p-002-1.jpg' },
  ],
};

export default function FragranceFinder() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<{ scent?: string; occasion?: string; intensity?: string }>({});
  const { addToCart } = useCart();

  const key = `${answers.scent ?? ''}|${answers.occasion ?? ''}|${answers.intensity ?? ''}`;
  const recs = RECOMMENDATIONS[key] ?? [];

  const reset = () => {
    setStep(0);
    setAnswers({});
  };

  return (
    <div>
      <button onClick={() => setOpen(true)} className="px-3 py-2 bg-gold text-white rounded">جرّب مستشار العطور</button>

      {open && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setOpen(false); reset(); }} />
          <div className="relative bg-white rounded-lg w-full max-w-2xl p-6 z-70">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">مستشار العطور - 3 خطوات</h3>
              <button onClick={() => { setOpen(false); reset(); }} className="p-2">إغلاق</button>
            </div>

            <div>
              {step === 0 && (
                <div>
                  <div className="text-sm mb-3">اختر نوع الروائح المفضّل</div>
                  <div className="grid grid-cols-2 gap-3">
                    {OPTIONS.scentTypes.map((s) => (
                      <button key={s} onClick={() => { setAnswers((a) => ({ ...a, scent: s })); setStep(1); }} className="p-3 border rounded text-sm">{s}</button>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <div className="text-sm mb-3">متى سترتدي هذا العطر؟</div>
                  <div className="grid grid-cols-2 gap-3">
                    {OPTIONS.occasion.map((s) => (
                      <button key={s} onClick={() => { setAnswers((a) => ({ ...a, occasion: s })); setStep(2); }} className="p-3 border rounded text-sm">{s}</button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <div className="text-sm mb-3">ما شدة الفوحان التي تريدها؟</div>
                  <div className="grid grid-cols-3 gap-3">
                    {OPTIONS.intensity.map((s) => (
                      <button key={s} onClick={() => { setAnswers((a) => ({ ...a, intensity: s })); }} className="p-3 border rounded text-sm">{s}</button>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button onClick={() => setStep(1)} className="px-3 py-2 border rounded">عودة</button>
                    <button onClick={() => setStep(3)} className="px-3 py-2 bg-gold text-white rounded">عرض النتائج</button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <div className="text-sm mb-3 font-semibold">التوصيات</div>
                  {recs.length === 0 && <div className="text-sm text-slate-500">لا توجد توصيات مباشرة — جرّب خيارات أخرى.</div>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {recs.map((r) => (
                      <div key={r.id} className="border rounded p-3 flex items-center gap-3">
                        <img src={r.image} alt={r.title} className="w-20 h-20 object-cover rounded" />
                        <div className="flex-1">
                          <div className="font-medium">{r.title}</div>
                          <div className="text-sm text-slate-500">{r.price.toLocaleString()} ج.م</div>
                        </div>
                        <button onClick={() => addToCart({ id: r.id, title: r.title, price: r.price, quantity: 1, volume: '50ml', image: r.image })} className="px-3 py-2 bg-gold text-white rounded">إضافة للسلة</button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button onClick={() => { setOpen(false); reset(); }} className="px-4 py-2 border rounded">إنهاء</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
