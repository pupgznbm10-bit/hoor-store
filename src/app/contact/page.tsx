'use client';

import { FormEvent, useState } from 'react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 text-center">
        <p className="text-sm font-medium text-[#a67c00]">التواصل</p>
        <h1 className="mt-2 text-3xl font-black text-[#111827]">تواصل معنا</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="rounded-[28px] bg-[#111827] p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.2)]">
          <h2 className="text-2xl font-black">معلومات التواصل</h2>
          <div className="mt-6 space-y-5 text-sm text-slate-200">
            <div>📞 الهاتف: +966 555 123 456</div>
            <div>✉️ البريد: hello@hoor.store</div>
            <div>📍 العنوان: الرياض — شارع الملك فهد — حي النخيل</div>
            <div>⏰ أوقات العمل: من 9 صباحًا إلى 10 مساءً</div>
          </div>
        </aside>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <h2 className="text-2xl font-black text-[#111827]">أرسل رسالة مباشرة</h2>

          {submitted ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-700">
              شكرًا لك، تم استلام رسالتك وسيتم التواصل معك خلال أقرب وقت.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input placeholder="الاسم الكامل" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#d4af37]" />
                <input placeholder="البريد الإلكتروني" type="email" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#d4af37]" />
              </div>
              <input placeholder="عنوان الرسالة" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#d4af37]" />
              <textarea rows={5} placeholder="اكتب رسالتك هنا..." className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#d4af37]" />
              <button type="submit" className="rounded-full bg-[#d4af37] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#c79d1e]">
                إرسال الرسالة
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
