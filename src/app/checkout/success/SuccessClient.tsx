'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order') || 'HO-0000';

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="rounded-[30px] border border-emerald-200 bg-white p-10 text-center shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#e9f9ee] text-5xl">✅</div>
        <p className="text-sm font-medium text-[#a67c00]">تمت العملية بنجاح</p>
        <h1 className="mt-2 text-4xl font-black text-[#111827]">تم تأكيد طلبك</h1>
        <p className="mt-4 text-lg text-slate-600">شكرًا لك على التسوق من متجر حور، سيتم تجهيز طلبك وتوصيله في أقرب وقت ممكن.</p>

        <div className="mt-8 rounded-[24px] border border-slate-200 bg-[#f9fafb] p-5 text-right text-sm text-slate-700">
          <div className="font-bold text-[#111827]">رقم الطلب</div>
          <div className="mt-2 text-lg font-black">{orderId}</div>
          <div className="mt-4 text-slate-500">سيتم إرسال تحديثات حالة الطلب إلى هاتفك والبريد الإلكتروني الخاص بك.</div>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/account" className="rounded-full bg-[#d4af37] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#c79d1e]">
            متابعة طلباتي
          </Link>
          <Link href="/products" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300">
            متابعة التسوق
          </Link>
        </div>
      </div>
    </div>
  );
}
