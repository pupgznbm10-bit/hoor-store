'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';

const quickReplies = [
  'أحتاج دعم حول الطلب',
  'كيف أسترجع منتج؟',
  'هل يوجد شحن مجاني؟',
  'كيف أختار العطر المناسب؟',
  'أرغب في طلب خاص',
];

function getAiReply(message: string) {
  const text = message.toLowerCase();

  if (/(استرجاع|إرجاع|رد|إلغاء|استبدال)/.test(text)) {
    return 'يمكنك طلب الاسترجاع خلال 7 أيام من الاستلام إذا كان المنتج سليمًا وغير مفتوح، وسنقوم بتوجيهك إلى الخطوات المطلوبة في أقل من 24 ساعة.';
  }

  if (/(شحن|توصيل|تسليم|المدينة|تتبع|طلب)/.test(text)) {
    return 'الشحن داخل المدن الرئيسية يتم خلال 24–72 ساعة، وبالنسبة للطلبات فوق 300 جنيه فالشحن مجاني. يمكنك متابعة طلبك من خلال رقم الطلب أو عبر خدمة العملاء.';
  }

  if (/(دفع|بطاقة|فودافون|كاش|الدفع)/.test(text)) {
    return 'نقبل الدفع عند الاستلام، بطاقة ائتمانية، وفودافون كاش. وستصلك رسالة تأكيد فور إتمام الطلب.';
  }

  if (/(عطر|رائحة|مناسب|اختيار|الهواية)/.test(text)) {
    return 'نقترح أن تختار حسب نوع الرائحة: العود والشرقي إذا كنت تحب الأثر الدافئ، والأزهار إذا كنت تفضل الأنثوية الرقيقة، والحمضيات للهواء المنعش.';
  }

  if (/(محتوى|منتج|جودة|جودة|تغليف|حالة|مشكلة)/.test(text)) {
    return 'نعتذر عن أي إزعاج. يرجى إرسال صورة واضحة للمنتج أو العبوة وسنقوم بتقييم المشكلة وتقديم الحل المناسب خلال وقت قصير.';
  }

  if (/(تجربة|مزايا|مميزة|خصم|تخفيض|عرض)/.test(text)) {
    return 'نقدم عروضاً موسمية خاصة على مجموعات العطور والباكتات المميزة، ويُطبق الخصم تلقائيًا عند إضافة المنتجات المناسبة.';
  }

  return 'شكرًا لرسالتك. نحن هنا لمساعدتك في طلبك، رائحتك، أو تفاصيل الشحن. إذا رغبت يمكننا متابعة طلبك أو اقتراح عطر يناسب مزاجك ومناسبة استخدامك.';
}

export default function SupportPage() {
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: 'مرحبًا! أنا مساعد متجر حور الرقمي. كيف يمكنني مساعدتك اليوم؟',
    },
  ]);
  const [input, setInput] = useState('');

  const quickText = useMemo(() => quickReplies, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { from: 'user', text: trimmed },
      { from: 'bot', text: getAiReply(trimmed) },
    ]);
    setInput('');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 text-center">
        <p className="text-sm font-medium text-[#a67c00]">خدمة العملاء</p>
        <h1 className="mt-2 text-3xl font-black text-[#111827]">دردشة الذكاء الاصطناعي لخدمة العملاء</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="rounded-[28px] bg-[#111827] p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
          <h2 className="text-2xl font-black">ماذا يمكننا مساعدتك به؟</h2>
          <div className="mt-6 space-y-3">
            {quickText.map((item) => (
              <button
                key={item}
                onClick={() => setInput(item)}
                className="block w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right text-sm font-medium text-slate-100 transition hover:bg-white/10"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-[#d4af37]/40 bg-[#1c2435] p-4 text-sm text-slate-200">
            <div className="font-bold text-[#f6d782]">أوقات الاستجابة</div>
            <div className="mt-2">الرد خلال 10–20 دقيقة خلال ساعات العمل.</div>
          </div>
        </aside>

        <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-lg font-black text-[#111827]">مساعد متجر حور</div>
              <div className="text-sm text-slate-500">متصل الآن</div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#ecfdf5] px-3 py-1 text-xs font-bold text-[#166534]">
              <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
              متصل
            </div>
          </div>

          <div className="space-y-4 rounded-[24px] bg-[#f9fafb] p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.from}-${index}`}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 ${
                  message.from === 'bot'
                    ? 'bg-white text-slate-700 shadow-sm'
                    : 'ml-auto bg-[#111827] text-white'
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="اكتب رسالتك هنا..."
              className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#d4af37] focus:bg-white"
            />
            <button type="submit" className="rounded-full bg-[#d4af37] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#c79d1e]">
              إرسال
            </button>
          </form>
        </section>
      </div>

      <div className="mt-6 text-center text-sm text-slate-500">
        أو تواصل مباشرة عبر <Link href="/contact" className="font-bold text-[#8a5f00]">التواصل المباشر</Link>
      </div>
    </div>
  );
}
