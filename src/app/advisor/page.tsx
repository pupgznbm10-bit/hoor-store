'use client';

import { useMemo, useState } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import products from '../../data/products.json';
import { useCart } from '../../context/CartContext';

const profileOptions = {
  gender: ['رجالي', 'نسائي', 'للجنسين'],
  scent: ['خشبية', 'عود وشرقي', 'حمضيات وثمار', 'فانيليا وزهور'],
  occasion: ['يومي', 'مناسبات رسمية', 'صيفي'],
};

const productList = products as any[];

const scoreMatch = (product: any, selected: { gender: string; scent: string; occasion: string }) => {
  let score = 65;
  if (selected.gender === 'رجالي' && (product.category === 'men' || product.category === 'oriental')) score += 18;
  if (selected.gender === 'نسائي' && (product.category === 'women' || product.category === 'oriental')) score += 18;
  if (selected.gender === 'للجنسين') score += 12;

  if (selected.scent === 'خشبية' && product.fragranceFamily.includes('خشب')) score += 14;
  if (selected.scent === 'عود وشرقي' && (product.category === 'oriental' || product.fragranceFamily.includes('عود'))) score += 18;
  if (selected.scent === 'حمضيات وثمار' && (product.fragranceFamily.includes('حمض') || product.fragranceFamily.includes('فاكه'))) score += 17;
  if (selected.scent === 'فانيليا وزهور' && (product.fragranceFamily.includes('زه') || product.fragranceFamily.includes('فاني'))) score += 16;

  if (selected.occasion === 'يومي' && product.price < 900) score += 10;
  if (selected.occasion === 'مناسبات رسمية' && product.price > 900) score += 14;
  if (selected.occasion === 'صيفي' && (product.category === 'women' || product.fragranceFamily.includes('حمض'))) score += 12;

  return Math.min(99, Math.max(80, score + Math.round(product.rating * 3)));
};

export default function AdvisorPage() {
  const { addToCart } = useCart();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState({ gender: 'رجالي', scent: 'عود وشرقي', occasion: 'مناسبات رسمية' });

  const matches = useMemo(() => {
    return [...productList]
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
      return;
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 text-center">
        <p className="text-sm font-medium text-[#a67c00]">مستشار العطور</p>
        <h1 className="mt-2 text-3xl font-black text-[#111827]">اختر رائحتك المثالية</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#a67c00]">
              <Sparkles size={18} />
              <span className="text-sm font-bold">خطوة {step + 1} من {Object.keys(profileOptions).length}</span>
            </div>
            <button onClick={() => setStep(0)} className="text-sm font-medium text-slate-500 hover:text-[#111827]">إعادة</button>
          </div>

          <div className="mb-5">
            <h2 className="text-2xl font-black text-[#111827]">
              {currentKey === 'gender' && 'المفضلة من حيث النوع؟'}
              {currentKey === 'scent' && 'ما نوع الرائحة التي تفضلها؟'}
              {currentKey === 'occasion' && 'ما المناسبة التي تود استخدامها لها؟'}
            </h2>
          </div>

          <div className="grid gap-3">
            {currentOptions.map((option) => (
              <button
                key={option}
                onClick={() => choose(option)}
                className={`rounded-2xl border px-4 py-4 text-right text-base font-bold transition-all duration-300 hover:scale-[1.01] hover:shadow-gold ${selected[currentKey] === option ? 'border-[#d4af37] bg-[#fff9e8] text-[#111827]' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
              >
                {option}
              </button>
            ))}
          </div>

          {step === Object.keys(profileOptions).length - 1 && (
            <div className="mt-8">
              <button onClick={() => setStep(0)} className="gold-btn rounded-full px-5 py-3 text-sm font-bold text-white">
                إعادة ضبط التفضيلات
              </button>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-[28px] bg-[#111827] p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.2)]">
            <p className="text-sm text-[#f6d782]">تكوينك الحالي</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(selected).map(([key, value]) => (
                <span key={key} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium">
                  {value}
                </span>
              ))}
            </div>
          </div>

          {matches.map(({ product, score }) => (
            <div key={product.id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="grid gap-4 p-4 md:grid-cols-[180px_1fr]">
                <img src={product.images?.[0]} alt={product.name} className="h-40 w-full rounded-2xl object-cover md:h-full" />
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-black text-[#111827]">{product.name}</h3>
                      <p className="text-sm text-slate-500">{product.brand}</p>
                    </div>
                    <div className="rounded-full bg-[#fff7de] px-3 py-2 text-sm font-black text-[#a67c00]">
                      تطابق {score}%
                    </div>
                  </div>

                  <p className="text-sm leading-6 text-slate-600">{product.description}</p>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-2xl font-black text-[#111827]">{product.price.toLocaleString()} ج.م</div>
                      <div className="text-xs text-slate-500">التقييم {product.rating}/5</div>
                    </div>
                    <button onClick={() => addToCart({ id: product.id, title: product.name, volume: product.volumes?.[0] ?? '50ml', price: product.price, quantity: 1, image: product.images?.[0] })} className="gold-btn rounded-full px-5 py-3 text-sm font-bold text-white">
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
