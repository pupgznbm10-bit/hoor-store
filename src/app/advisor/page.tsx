'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, Sparkles, Star, Wand2 } from 'lucide-react';
import products from '../../data/products.json';
import { useCart } from '../../context/CartContext';

type ProductItem = {
  id?: string;
  name?: string;
  brand?: string;
  category?: string;
  price?: number;
  rating?: number;
  description?: string;
  fragranceFamily?: string;
  images?: string[];
  volumes?: string[];
};

const profileOptions = {
  gender: ['رجالي', 'نسائي', 'للجنسين'],
  scent: ['خشبية', 'عود وشرقي', 'حمضيات وثمار', 'فانيليا وزهور'],
  occasion: ['يومي', 'مناسبات رسمية', 'صيفي'],
};

const safeImage = (product: ProductItem) => product.images?.[0] || '/placeholder.png';
const productList = products as ProductItem[];

const scoreMatch = (product: ProductItem, selected: { gender: string; scent: string; occasion: string }) => {
  let score = 65;
  const fragrance = (product.fragranceFamily || '').toLowerCase();

  if (selected.gender === 'رجالي' && (product.category === 'men' || product.category === 'oriental')) score += 18;
  if (selected.gender === 'نسائي' && (product.category === 'women' || product.category === 'oriental')) score += 18;
  if (selected.gender === 'للجنسين') score += 12;

  if (selected.scent === 'خشبية' && fragrance.includes('خشب')) score += 14;
  if (selected.scent === 'عود وشرقي' && (product.category === 'oriental' || fragrance.includes('عود'))) score += 18;
  if (selected.scent === 'حمضيات وثمار' && (fragrance.includes('حمض') || fragrance.includes('فاكه'))) score += 17;
  if (selected.scent === 'فانيليا وزهور' && (fragrance.includes('زه') || fragrance.includes('فاني'))) score += 16;

  if (selected.occasion === 'يومي' && (product.price ?? 0) < 900) score += 10;
  if (selected.occasion === 'مناسبات رسمية' && (product.price ?? 0) > 900) score += 14;
  if (selected.occasion === 'صيفي' && (product.category === 'women' || fragrance.includes('حمض'))) score += 12;

  return Math.min(99, Math.max(82, score + Math.round((product.rating ?? 0) * 3)));
};

export default function AdvisorPage() {
  const { addToCart } = useCart();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState({ gender: 'رجالي', scent: 'عود وشرقي', occasion: 'مناسبات رسمية' });

  const matches = useMemo(() => {
    return [...productList]
      .filter((product) => product && (product.name || product.brand || product.category))
      .map((product) => ({
        product,
        score: scoreMatch(product, selected),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [selected]);

  const currentOptions = Object.values(profileOptions)[step];
  const currentKey = Object.keys(profileOptions)[step] as keyof typeof profileOptions;

  const choose = (value: string) => {
    const next = { ...selected, [currentKey]: value };
    setSelected(next);
    if (step < Object.keys(profileOptions).length - 1) {
      setStep((prev) => prev + 1);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 overflow-hidden rounded-[32px] bg-gradient-to-r from-[#111827] via-[#1c2332] to-[#d4af37] p-8 text-white shadow-[0_30px_70px_rgba(17,24,39,0.25)]">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold tracking-[0.25em] text-[#f7d98d] uppercase">
              <Sparkles size={14} />
              مستشار العطور
            </div>
            <h1 className="text-3xl font-black md:text-5xl">اختر رائحتك المثالية</h1>
          </div>
          <Link href="/products" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-white/90 transition hover:bg-white/10">
            تصفح كل العطور
            <ArrowLeft size={16} />
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[30px] border border-[#efe5d4] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#a67c00]">
              <Wand2 size={18} />
              <span className="text-sm font-bold">خطوة {step + 1} من {Object.keys(profileOptions).length}</span>
            </div>
            <button onClick={() => setStep(0)} className="text-sm font-medium text-slate-500 hover:text-[#111827]">إعادة</button>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-black text-[#111827]">
              {currentKey === 'gender' && 'ما نوعك المفضل؟'}
              {currentKey === 'scent' && 'ما نوع الرائحة التي تفضلها؟'}
              {currentKey === 'occasion' && 'ما المناسبة التي ستستخدم فيها العطر؟'}
            </h2>
          </div>

          <div className="grid gap-3">
            {currentOptions.map((option) => (
              <button
                key={option}
                onClick={() => choose(option)}
                className={`rounded-[22px] border px-4 py-4 text-right text-base font-bold transition-all duration-300 ${selected[currentKey] === option ? 'border-[#d4af37] bg-[#fff9e8] text-[#111827] shadow-[0_14px_35px_rgba(212,175,55,0.18)]' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-[#d4af37] hover:bg-[#fffaf0]'}`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-[22px] bg-[#f7f3ea] p-4">
            <p className="text-xs font-bold tracking-[0.25em] text-[#8a5f00] uppercase">تفضيلاتك الحالية</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(selected).map(([key, value]) => (
                <span key={key} className="rounded-full border border-[#eadab0] bg-white px-3 py-2 text-sm font-medium text-[#1f2937]">
                  {value}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[30px] border border-[#efe5d4] bg-[#111827] p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.2)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-[#f6d782]">أقرب التوصيات لك</p>
                <h3 className="mt-2 text-2xl font-black">الملف العطري المثالي</h3>
              </div>
              <div className="rounded-full bg-white/10 px-3 py-2 text-sm font-bold text-[#f6d782]">
                {matches[0]?.score ?? 90}%
              </div>
            </div>
          </div>

          {matches.map(({ product, score }) => (
            <div key={product.id} className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="grid gap-4 p-4 md:grid-cols-[180px_1fr]">
                <img src={safeImage(product)} alt={product.name || 'منتج'} className="h-40 w-full rounded-[22px] object-cover md:h-full" />
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-black text-[#111827]">{product.name || 'منتج فاخر'}</h3>
                      <p className="text-sm text-slate-500">{product.brand || 'Hoor'}</p>
                    </div>
                    <div className="rounded-full bg-[#fff7de] px-3 py-2 text-sm font-black text-[#a67c00]">
                      تطابق {score}%
                    </div>
                  </div>

                  <p className="text-sm leading-6 text-slate-600">{product.description || 'رائحة متوازنة تجمع بين الهدوء والفخامة'}</p>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div>
                      <div className="text-2xl font-black text-[#111827]">{(product.price ?? 0).toLocaleString()} ج.م</div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <Star size={12} className="fill-[#f6c453] text-[#f6c453]" />
                        {(product.rating ?? 0).toFixed(1)}/5
                      </div>
                    </div>
                    <button
                      onClick={() => addToCart({
                        id: product.id ?? 'advisor-product',
                        title: product.name ?? 'منتج فاخر',
                        volume: product.volumes?.[0] ?? '50ml',
                        price: product.price ?? 0,
                        quantity: 1,
                        image: safeImage(product),
                      })}
                      className="rounded-full bg-[#d4af37] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_25px_rgba(212,175,55,0.3)] transition hover:bg-[#c79d1e]"
                    >
                      إضافة إلى السلة
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
