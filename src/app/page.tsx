'use client';

import React from 'react';
import Link from 'next/link';
import ProductCard, { type Product } from '../components/ProductCard';
import ScrollingBanner from '../components/ScrollingBanner';
import FragranceFinder from '../components/FragranceFinder';
import AboutSection from '../components/AboutSection';
import products from '../data/products.json';

const FEATURED_PRODUCTS: Product[] = (products as Product[])
  .filter((product) => product.bestseller)
  .slice(0, 4);

const CATEGORY_CARDS = [
  {
    title: 'عطور رجالية',
    subtitle: 'قوة، أناقة، ودفء',
    href: '/category/men',
    accent: 'from-[#111827] via-[#1f2937] to-[#d4af37]',
    image: 'https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'عطور نسائية',
    subtitle: 'زهور، ناعم، ومميز',
    href: '/category/women',
    accent: 'from-[#b68a5f] via-[#d7b38c] to-[#f3e5d7]',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'عطور شرقية وعود',
    subtitle: 'غنى، عميق، وملامح فاخرة',
    href: '/category/oriental',
    accent: 'from-[#4b2e2d] via-[#7a4b3a] to-[#d4af37]',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'عينات وتجارب',
    subtitle: 'اكتشف رائحتك المفضلة',
    href: '/category/samples',
    accent: 'from-[#1a1a1a] via-[#3d3d3d] to-[#d2b36c]',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f9f7f3]">
      <ScrollingBanner text="✨ اكتشف أفخم العطور الفاخرة مع أفضل الأسعار والخدمة الممتازة ✨" speed={30} />
      
      <section
        className="relative w-full max-w-full overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(15,23,42,0.22), rgba(15,23,42,0.08)), url('/uploads/hoor-banner.png')",
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <div className="mx-auto w-full max-w-6xl px-3 py-16 text-right text-white sm:px-6 sm:py-24 md:py-28">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-medium tracking-[0.2em] text-[#f6d782] sm:text-sm">LUXURY PERFUMERY</p>
            <h1 className="text-3xl font-black leading-tight sm:text-4xl md:text-6xl">متجر حور</h1>
            <h2 className="mt-2 text-xl font-semibold sm:text-2xl md:text-4xl">بوتيك العطور الفاخرة</h2>
            <p className="mt-4 max-w-xl text-sm text-white/85 sm:text-base md:text-lg">
              اكتشف تشكيلتنا المختارة من العطور الراقية، المزيج المثالي بين الأصالة والحداثة، مع توصيل فاخر وحملات مميزة.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-2 sm:gap-3">
              <Link href="/products" className="rounded-full bg-[#d4af37] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#d4af37]/30 btn-hover-bounce transition sm:px-6 sm:py-3">استكشف التشكيلة</Link>
              <FragranceFinder />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="mb-3 text-sm font-medium text-[#a67c00]">ماذا يميزنا</p>
            <h2 className="text-3xl font-black text-[#111827]">هرم الرائحة — رحلة عطرك من الوهج إلى الدوام</h2>
            <p className="mt-4 max-w-2xl text-slate-600">
              يكوّن كل عطر في متجر حور طبقات متوازنة من النغمات الأولية، القلب، والقواعد، مع تركيبة متوازنة تترك أثرًا فريدًا لا يُمحى.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                { title: 'الافتتاحية', text: 'حمضيات منعشة وملامح خفيفة تفتح الرائحة بشكل أنيق.' },
                { title: 'قلب العطر', text: 'زهرية وبهارات متناسقة تمنح العطر شخصيته الفريدة.' },
                { title: 'قاعدة العطر', text: 'عود، عنبر، و خشب يترك أثراً طويل المدى ومهيباً.' },
              ].map((item) => (
                <div key={item.title} className="card-hover rounded-[24px] border border-[#efe5d4] bg-white p-5 shadow-sm">
                  <div className="mb-3 text-lg font-black text-[#111827]">{item.title}</div>
                  <p className="text-sm leading-7 text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="card-hover rounded-[28px] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-medium text-[#a67c00]">تجربة ذكية</p>
            <h3 className="mt-3 text-2xl font-black text-[#111827]">مستشار العطور</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">اختر رائحتك حسب مزاجك، المناسبة، أو النغمات التي تحبها، وسنقترح لك أفضل الخيارات.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {['زهري', 'عودي', 'مائي', 'وردي'].map((chip) => (
                <button key={chip} className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 btn-hover-bounce transition hover:bg-[#f3e7c6]">{chip}</button>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#a67c00]">تصفح حسب النوع</p>
            <h3 className="mt-1 text-3xl font-black text-[#111827]">اكتشف قسمك المفضل</h3>
          </div>
          <Link href="/products" className="text-sm font-bold text-[#8a5f00] transition hover:text-[#6b4a00]">عرض كل المنتجات</Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {CATEGORY_CARDS.map((category) => (
            <Link key={category.title} href={category.href} className="group relative overflow-hidden rounded-[28px] border border-[#efe5d4] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(15,23,42,0.12)]">
              <div className={`absolute inset-0 bg-gradient-to-br ${category.accent} opacity-90`} />
              <img src={category.image} alt={category.title} className="absolute inset-0 h-full w-full object-cover opacity-30 transition duration-500 group-hover:scale-105" />
              <div className="relative flex min-h-[260px] flex-col justify-between p-5 text-white">
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10px] font-medium backdrop-blur-sm">مجموعة مختارة</span>
                </div>
                <div>
                  <p className="text-xs tracking-[0.22em] text-white/70">HOOR</p>
                  <h4 className="mt-2 text-2xl font-black">{category.title}</h4>
                  <p className="mt-2 text-sm text-white/80">{category.subtitle}</p>
                </div>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white/90">
                  استكشف الآن
                  <span aria-hidden="true">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#a67c00]">أكثر المفضلة</p>
            <h3 className="mt-1 text-3xl font-black text-[#111827]">الأكثر مبيعاً</h3>
          </div>
          <Link href="/products" className="text-sm font-bold text-[#8a5f00] transition hover:text-[#6b4a00]">عرض المجموعة كاملة</Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_PRODUCTS.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <AboutSection />

      <section className="mt-10 bg-[#111827] py-12">
        <div className="mx-auto max-w-6xl px-6 text-center text-white">
          <p className="text-sm font-medium text-[#f6d782]">بداية مميزة</p>
          <h4 className="mt-2 text-3xl font-black">هل تحتاج مساعدة في اختيار عطرك؟</h4>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            فريقنا المختص يرافقك لاختيار العطر المناسب لك من حيث النغمات، المذاق، والمناسبة.
          </p>
          <div className="mt-6 flex justify-center">
            <FragranceFinder />
          </div>
        </div>
      </section>
      
      <ScrollingBanner text="🎁 توصيل فاخر | خدمة العملاء 24/7 | ضمان الرضا 100%" speed={25} />
    </div>
  );
}
