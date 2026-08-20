'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function CheckoutPage() {
  const { cartItems, subtotal, clearCart } = useCart();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [shipping, setShipping] = useState({ name: '', phone: '', city: '', address: '' });
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'vodafone'>('cod');
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const cityRef = useRef<HTMLInputElement | null>(null);
  const addrRef = useRef<HTMLTextAreaElement | null>(null);
  const shippingFee = 40;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?redirect=/checkout');
    }
  }, [user, loading, router]);

  const total = subtotal + shippingFee;

  const placeOrder = async () => {
    if (!user || cartItems.length === 0) {
      toast.error('لا توجد منتجات في السلة', { description: 'أضف منتجًا قبل إتمام الطلب' });
      return;
    }

    // client-side validation: ensure shipping city and address (or at least phone) are provided
    const finalFullName = shipping.name || user.fullName;
    const finalPhone = shipping.phone || user.phone;
    const finalCity = shipping.city && shipping.city.trim();
    const finalAddress = shipping.address && shipping.address.trim();

    const missing: string[] = [];
    if (!finalFullName) missing.push('الاسم الكامل');
    if (!finalPhone) missing.push('الهاتف');
    if (!finalCity) missing.push('المدينة');
    if (!finalAddress) missing.push('العنوان');

    if (missing.length) {
      const message = `يرجى إدخال: ${missing.join('، ')}`;
      setValidationError(message);
      // bring user back to the shipping step
      setStep(1);
      // focus the first missing field
      if (missing.includes('الاسم الكامل')) {
        setTimeout(() => nameRef.current?.focus(), 50);
      } else if (missing.includes('الهاتف')) {
        setTimeout(() => phoneRef.current?.focus(), 50);
      } else if (missing.includes('المدينة')) {
        setTimeout(() => cityRef.current?.focus(), 50);
      } else if (missing.includes('العنوان')) {
        setTimeout(() => addrRef.current?.focus(), 50);
      }

      // also show a toast for visibility
      toast.error('مطلوب معلومات الشحن', { description: message });
      return;
    }

    // clear any previous validation error
    setValidationError(null);

    setLoadingOrder(true);
    try {
      const orderPayload = {
        fullName: finalFullName,
        phone: finalPhone,
        city: finalCity,
        address: finalAddress,
        paymentMethod,
        total,
        items: cartItems.map((item) => ({
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          volume: item.volume,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'فشل حفظ الطلب');
      }

      toast.success('تم تأكيد طلبك بنجاح', {
        description: `رقم الطلب: ${data.order.id}`,
      });
      clearCart();
      // If the user provided shipping details and they are not already saved, persist them to the profile
      try {
        const shouldSave = Boolean(finalPhone || finalCity || finalAddress) && (
          !user.phone || !user.city || !user.address
        );
        if (shouldSave && typeof (await import('../../context/AuthContext')).useAuth === 'function') {
          // call the exposed updateProfile from the auth context if available
          try {
            await fetch('/api/auth/update-profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fullName: finalFullName, phone: finalPhone, city: finalCity, address: finalAddress }),
            });
            // also update local storage copy used by AuthContext
            try {
              const stored = localStorage.getItem('hoor_user_v1');
              if (stored) {
                const u = JSON.parse(stored);
                u.fullName = finalFullName || u.fullName;
                u.phone = finalPhone || u.phone;
                u.city = finalCity || u.city;
                u.address = finalAddress || u.address;
                localStorage.setItem('hoor_user_v1', JSON.stringify(u));
              }
            } catch (e) {}
          } catch (e) {
            console.warn('failed to save shipping to profile', e);
          }
        }
      } catch (e) {}

      router.push(`/checkout/success?order=${encodeURIComponent(data.order.id)}`);
      setStep(4);
    } catch (error) {
      console.error('placeOrder error', error);
      // surface server-provided message if available
      const msg = (error instanceof Error && error.message) ? error.message : 'يرجى المحاولة مرة أخرى';
      toast.error('تعذر تأكيد الطلب', { description: msg });
    } finally {
      setLoadingOrder(false);
    };  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-slate-500">جاري التحقق من الحساب...</div>;
  }

  if (!user) return null;

  if (step === 4) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-[28px] bg-white p-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#e9f9ee] text-3xl">✅</div>
          <h2 className="mb-3 text-3xl font-black text-[#111827]">تم تأكيد الطلب</h2>
          <p className="text-lg text-slate-600">شكرًا لتسوقك من متجر حور! سيتم التواصل معك لتأكيد تفاصيل الشحن.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <p className="text-sm font-medium text-[#a67c00]">إتمام الطلب</p>
        <h1 className="mt-2 text-3xl font-black text-[#111827]">تأكيد الشحن والدفع</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-7">
          {step === 1 && (
            <div>
              <h3 className="mb-5 text-2xl font-bold text-[#111827]">تفاصيل الشحن</h3>
              <div className="grid grid-cols-1 gap-4">
                {validationError && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{validationError}</div>
                )}
                <input ref={nameRef} placeholder="الاسم الكامل" value={shipping.name} onChange={(e) => setShipping({ ...shipping, name: e.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#d4af37] focus:bg-white" />
                <input ref={phoneRef} placeholder="رقم الهاتف" value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#d4af37] focus:bg-white" />
                <input ref={cityRef} placeholder="المدينة" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#d4af37] focus:bg-white" />
                <textarea ref={addrRef} placeholder="العنوان التفصيلي" rows={4} value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#d4af37] focus:bg-white" />
              </div>

              <div className="mt-6 flex justify-end">
                <button onClick={() => setStep(2)} className="rounded-full bg-[#d4af37] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#c79d1e]">متابعة إلى الدفع</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="mb-5 text-2xl font-bold text-[#111827]">طريقة الدفع</h3>
              <div className="space-y-3">
                {[
                  { value: 'cod', label: 'الدفع عند الاستلام' },
                  { value: 'card', label: 'بطاقة ائتمانية' },
                  { value: 'vodafone', label: 'فودافون كاش' },
                ].map((option) => (
                  <label key={option.value} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-[#d4af37] hover:bg-white">
                    <input type="radio" name="pay" checked={paymentMethod === option.value} onChange={() => setPaymentMethod(option.value as 'cod' | 'card' | 'vodafone')} className="h-4 w-4 accent-[#d4af37]" />
                    <span className="text-sm font-medium text-[#1f2937]">{option.label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <button onClick={() => setStep(1)} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700">عودة</button>
                <button onClick={() => setStep(3)} className="rounded-full bg-[#d4af37] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#c79d1e]">مراجعة الطلب</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="mb-5 text-2xl font-bold text-[#111827]">مراجعة وتأكيد</h3>
              <div className="space-y-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <div>اسم المستلم: <span className="font-bold text-[#111827]">{shipping.name}</span></div>
                <div>الهاتف: <span className="font-bold text-[#111827]">{shipping.phone}</span></div>
                <div>المدينة: <span className="font-bold text-[#111827]">{shipping.city}</span></div>
                <div>العنوان: <span className="font-bold text-[#111827]">{shipping.address}</span></div>
                <div>طريقة الدفع: <span className="font-bold text-[#111827]">{paymentMethod === 'cod' ? 'الدفع عند الاستلام' : paymentMethod === 'card' ? 'بطاقة ائتمانية' : 'فودافون كاش'}</span></div>
              </div>

              <div className="mt-6 flex gap-3">
                <button onClick={() => setStep(2)} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700">عودة</button>
                <button onClick={placeOrder} disabled={loadingOrder} className="rounded-full bg-[#d4af37] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#c79d1e] disabled:opacity-60">{loadingOrder ? 'جاري التأكيد...' : 'تأكيد الطلب الآن'}</button>
              </div>
            </div>
          )}
        </div>

        <aside className="rounded-[28px] bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-6">
          <h4 className="mb-4 text-xl font-black text-[#111827]">ملخص الطلب</h4>
          <div className="space-y-4">
            {cartItems.length === 0 && <div className="text-sm text-slate-500">لا توجد منتجات في السلة.</div>}
            {cartItems.map((it) => (
              <div key={`${it.id}::${it.volume}`} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                <div>
                  <div className="text-sm font-bold text-[#1f2937]">{it.title}<span className="ml-2 text-xs text-slate-400">{it.volume}</span></div>
                  <div className="text-xs text-slate-500">{it.quantity} × {it.price.toLocaleString()} ج.م</div>
                </div>
                <div className="font-bold text-[#111827]">{(it.price * it.quantity).toLocaleString()} ج.م</div>
              </div>
            ))}

            <div className="space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-700">
              <div className="flex items-center justify-between"><span>المجموع</span><span className="font-semibold">{subtotal.toLocaleString()} ج.م</span></div>
              <div className="flex items-center justify-between"><span>تكلفة الشحن</span><span className="font-semibold">{shippingFee.toLocaleString()} ج.م</span></div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-lg font-black text-[#111827]"><span>الإجمالي</span><span>{total.toLocaleString()} ج.م</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
