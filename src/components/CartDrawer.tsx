'use client';

import React, { useMemo, useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, Plus, Minus, Trash } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

/**
 * CartDrawer: Slide-out drawer from the right (RTL).
 * - Lists items
 * - Quantity controls
 * - Free shipping progress bar
 * - Promo code input
 */
export default function CartDrawer() {
  const { cartItems, isCartOpen, toggleCart, updateQuantity, removeFromCart, subtotal, freeShippingThreshold, applyPromoCode } = useCart();
  const [promo, setPromo] = useState('');
  const [promoResult, setPromoResult] = useState<{ success: boolean; discountAmount: number } | null>(null);

  const remaining = Math.max(0, freeShippingThreshold - subtotal);
  const progress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const totalWithPromo = useMemo(() => {
    const discount = promoResult?.discountAmount ?? 0;
    return Math.max(0, subtotal - discount);
  }, [subtotal, promoResult]);

  const { user } = useAuth();
  const router = useRouter();

  const handleCheckout = () => {
    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً لإتمام طلبك');
      router.push('/auth/login?redirect=/checkout');
      toggleCart();
      return;
    }

    router.push('/checkout');
    toggleCart();
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={toggleCart} aria-hidden />

      {/* Drawer */}
      <aside className="relative ml-auto w-full max-w-md h-full bg-white shadow-2xl p-4 overflow-y-auto" dir="rtl" aria-label="سلة المشتريات">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">سلة المشتريات</h3>
          <button onClick={toggleCart} className="p-2 rounded-md hover:bg-slate-100">
            <X />
          </button>
        </div>

        {/* Items list */}
        <div className="space-y-4">
          {cartItems.length === 0 && <div className="text-sm text-slate-500">لا توجد منتجات في السلة بعد.</div>}
          {cartItems.map((it) => (
            <div key={`${it.id}::${it.volume}`} className="flex items-center gap-3 border-b pb-3">
              <div className="relative h-20 w-20 overflow-hidden rounded-md bg-slate-50">
                {it.image && <img src={it.image} alt={it.title} className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium">{it.title}</div>
                    <div className="text-xs text-slate-400 mt-1">{it.volume}</div>
                  </div>
                  <div className="text-sm font-semibold">{(it.price * it.quantity).toLocaleString()} ج.م</div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button onClick={() => updateQuantity(it.id, it.volume, Math.max(1, it.quantity - 1))} className="p-2 rounded-md bg-slate-100">
                    <Minus size={14} />
                  </button>
                  <div className="px-3 py-1 border rounded">{it.quantity}</div>
                  <button onClick={() => updateQuantity(it.id, it.volume, it.quantity + 1)} className="p-2 rounded-md bg-slate-100">
                    <Plus size={14} />
                  </button>

                  <button onClick={() => removeFromCart(it.id, it.volume)} className="ml-auto text-red-600 p-2">
                    <Trash size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Free shipping progress */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <div>الشحن المجاني</div>
            <div className="font-semibold">{remaining === 0 ? 'لقد حصلت على الشحن المجاني!' : `باقي ${remaining.toLocaleString()} ج.م`}</div>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-3 bg-gold" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Promo code */}
        <div className="mt-6">
          <label htmlFor="promo" className="text-sm font-medium">كود الخصم</label>
          <div className="flex gap-2 mt-2">
            <input id="promo" value={promo} onChange={(e) => setPromo(e.target.value)} className="flex-1 px-3 py-2 border rounded" placeholder="أدخل كود الخصم" />
            <button onClick={() => setPromoResult(applyPromoCode(promo))} className="px-4 py-2 bg-charcoalText text-white rounded">تطبيق</button>
          </div>
          {promoResult && (
            <div className={`mt-2 text-sm ${promoResult.success ? 'text-green-600' : 'text-red-600'}`}>
              {promoResult.success ? `تم تطبيق ${promoResult.discountAmount.toLocaleString()} ج.م` : 'كود غير صالح أو شروط غير مستوفاة'}
            </div>
          )}
        </div>

        {/* Summary & CTA */}
        <div className="mt-6 border-t pt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <div>المجموع</div>
            <div className="font-semibold">{subtotal.toLocaleString()} ج.م</div>
          </div>
          <div className="flex items-center justify-between text-sm mb-4">
            <div>بعد الخصم</div>
            <div className="font-bold text-lg">{totalWithPromo.toLocaleString()} ج.م</div>
          </div>

          <button onClick={handleCheckout} className="w-full py-3 bg-gold text-white rounded-md shadow-md font-semibold">متابعة إتمام الطلب</button>
        </div>
      </aside>
    </div>
  );
}
