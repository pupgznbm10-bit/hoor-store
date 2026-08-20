'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-[#111827] text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img src="/hoor-logo.jfif" alt="شعار حور" className="h-12 w-12 rounded-full border border-[#d4af37] bg-white object-cover" />
            <div>
              <div className="text-xl font-black text-white">حور</div>
              <div className="text-xs tracking-[0.2em] text-[#f6d782]">HOOR</div>
            </div>
          </div>
          <p className="text-sm leading-7 text-slate-300">
            بوتيك عطور فاخر يجمع بين الرواية الشرقية واللمسة الحديثة، ليمنحك تجربة رائحة مميزة كل يوم.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-black text-white">روابط سريعة</h3>
          <ul className="space-y-3 text-sm text-slate-300">
            <li><Link href="/products" className="hover:text-[#d4af37] icon-shadow transition">كل المنتجات</Link></li>
            <li><Link href="/category/men" className="hover:text-[#d4af37] icon-shadow transition">عطور رجالية</Link></li>
            <li><Link href="/category/women" className="hover:text-[#d4af37] icon-shadow transition">عطور نسائية</Link></li>
            <li><Link href="/advisor" className="hover:text-[#d4af37] icon-shadow transition">مستشار العطور</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-black text-white">الدعم</h3>
          <ul className="space-y-3 text-sm text-slate-300">
            <li><Link href="/support" className="hover:text-[#d4af37] icon-shadow transition">خدمة العملاء</Link></li>
            <li><Link href="/faq" className="hover:text-[#d4af37] icon-shadow transition">الأسئلة الشائعة</Link></li>
            <li><Link href="/contact" className="hover:text-[#d4af37] icon-shadow transition">التواصل</Link></li>
            <li><Link href="/about" className="hover:text-[#d4af37] icon-shadow transition">من نحن</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-black text-white">تواصل معنا</h3>
          <ul className="space-y-3 text-sm text-slate-300">
            <li>📞 966-555-1234</li>
            <li>✉️ hello@hoor.store</li>
            <li>📍 الرياض — المملكة العربية السعودية</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-sm text-slate-400">© 2026 متجر حور — كل الحقوق محفوظة</div>
      </div>
    </footer>
  );
}
