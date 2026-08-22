'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, MapPin, Package, ShieldCheck, UserRound, LogOut } from 'lucide-react';

type UserOrder = {
  id: string;
  total: number;
  status: 'Pending' | 'Shipped' | 'Delivered';
  createdAt: string;
  items: Array<{ title: string; quantity: number; volume?: string; price: number }>;
  deliveryEstimate?: string;
  shippedAt?: string;
  deliveredAt?: string;
  revenueReleased?: boolean;
};

export default function AccountPage() {
  const { user, loading, logout, isAdmin } = useAuth();
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadOrders = async () => {
      try {
        const res = await fetch('/api/orders?me=1', { cache: 'no-store' });
        const data = await res.json();
        setOrders(res.ok ? data.orders : []);
      } catch (error) {
        console.warn('failed to load user orders', error);
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  const confirmDelivery = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/confirm-delivered`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        // reload orders
        const r = await fetch('/api/orders?me=1', { cache: 'no-store' });
        const d = await r.json();
        setOrders(r.ok ? d.orders : []);
        alert(data.message || 'تم تأكيد الاستلام');
      } else {
        alert(data.message || 'فشل تأكيد الاستلام');
      }
    } catch (err) {
      console.error('confirmDelivery error', err);
      alert('خطأ في النظام');
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-20 text-center text-slate-500">جاري تحميل حسابك...</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <div className="rounded-[28px] bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#faf3d8] text-3xl">🔐</div>
          <h1 className="mt-6 text-3xl font-black text-[#111827]">تسجيل الدخول مطلوب</h1>
          <p className="mt-3 text-slate-600">يرجى تسجيل الدخول للوصول إلى حسابك وإدارة الطلبات.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/auth/login" className="rounded-full bg-[#d4af37] px-6 py-3 text-sm font-bold text-white">تسجيل الدخول</Link>
            <Link href="/auth/register" className="rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700">إنشاء حساب</Link>
          </div>
        </div>
      </div>
    );
  }

  const initials = user.fullName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#a67c00]">الحساب الشخصي</p>
          <h1 className="mt-2 text-3xl font-black text-[#111827]">مرحبًا، {user.fullName}</h1>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link href="/admin" className="inline-flex items-center gap-2 rounded-full bg-[#111827] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#1f2937]">
              <ShieldCheck size={16} />
              لوحة الإدارة
            </Link>
          )}
          <button onClick={() => logout()} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
            <LogOut size={16} />
            تسجيل الخروج
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[28px] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#111827] text-lg font-black text-white">{initials}</div>
            <div>
              <div className="text-xl font-black text-[#111827]">{user.fullName}</div>
              <div className="text-sm text-slate-500">{user.email}</div>
            </div>
            <div className="ml-auto">
              <Link href="/account/edit" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 transition hover:border-slate-300">تعديل البيانات</Link>
            </div>
          </div>

          {(!user.phone || !user.city || !user.address) && (
            <div className="mt-4 rounded-md border-l-4 border-[#d4af37] bg-[#fff8e6] p-4 text-sm">
              <div className="font-semibold">مرحبًا! يبدو أن بيانات الشحن ناقصة.</div>
              <div className="mt-1">يرجى تحديث بياناتك لتسهيل عملية الطلب — يمكنك تحديث كل شيء ماعدا البريد الإلكتروني.</div>
              <div className="mt-3">
                <Link href="/account/edit" className="inline-flex items-center gap-2 rounded-full bg-[#d4af37] px-4 py-2 text-sm font-bold text-white">تحديث بياناتي</Link>
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#faf8f2] p-4">
              <div className="mb-2 flex items-center gap-2 text-[#a67c00]"><UserRound size={16} /> الملف الشخصي</div>
              <div className="text-sm text-slate-600">الاسم الكامل: <span className="font-bold text-[#111827]">{user.fullName}</span></div>
              <div className="mt-2 text-sm text-slate-600">البريد: <span className="font-bold text-[#111827]">{user.email}</span></div>
            </div>

            <div className="rounded-2xl bg-[#f7f7fb] p-4">
              <div className="mb-2 flex items-center gap-2 text-[#4f46e5]"><ShieldCheck size={16} /> الأمان</div>
              <div className="text-sm text-slate-600">حالة الجلسة: <span className="font-bold text-[#111827]">نشطة</span></div>
              <div className="mt-2 text-sm text-slate-600">تاريخ التسجيل: <span className="font-bold text-[#111827]">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-EG') : 'حديث'}</span></div>
            </div>
          </div>
        </section>

        <aside className="rounded-[28px] bg-[#111827] p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
          <div className="flex items-center gap-2 text-[#f4d77d]"><MapPin size={16} /> عنوان التسليم</div>
          <div className="mt-4 rounded-2xl bg-white/5 p-4 text-sm leading-7 text-slate-200">
            <div className="font-medium text-white">المدينة: الرياض</div>
            <div>شارع النخيل، حي النزهة، المبنى 12</div>
            <div>رقم الهاتف: {user.phone || 'غير مسجل'}</div>
          </div>

          <Link href="/checkout" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#d4af37] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c79d1e]">
            إتمام الطلب
            <ArrowLeft size={14} />
          </Link>
        </aside>
      </div>

      <section className="mt-8 rounded-[28px] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="mb-5 flex items-center gap-2 text-[#111827]">
          <Package size={18} className="text-[#a67c00]" />
          <h2 className="text-2xl font-black">طلباتي الأخيرة</h2>
        </div>

        {ordersLoading ? (
          <div className="text-sm text-slate-500">جاري تحميل الطلبات...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            لا توجد طلبات حتى الآن. ابدأ بتسوق منتجاتك المفضلة.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const itemSummary = order.items.map((item) => `${item.title} × ${item.quantity}`).join('، ');
              return (
                <div key={order.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-[#f8fafc] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm text-slate-500">{order.id}</div>
                    <div className="mt-1 text-base font-bold text-[#111827]">{itemSummary}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end gap-2">
                      <span className="rounded-full bg-[#eef7ed] px-3 py-1 text-xs font-bold text-[#146c43]">
                        {order.status === 'Pending' ? 'قيد الانتظار' : order.status === 'Shipped' ? 'تم الشحن' : 'تم الاستلام'}
                      </span>
                      <span className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
                      {order.deliveryEstimate && <span className="text-xs text-slate-500">موعد التوصيل المتوقع: <span className="font-semibold text-slate-700">{order.deliveryEstimate}</span></span>}
                      {order.shippedAt && <span className="text-xs text-slate-500">تاريخ الشحن: <span className="font-semibold text-slate-700">{new Date(order.shippedAt).toLocaleString('ar-EG')}</span></span>}
                      {order.deliveredAt && <span className="text-xs text-slate-500">تاريخ التسليم: <span className="font-semibold text-slate-700">{new Date(order.deliveredAt).toLocaleString('ar-EG')}</span></span>}
                    </div>

                    {/* If shipped and not yet delivered allow confirming delivery */}
                    {order.status === 'Shipped' && !order.deliveredAt && (
                      <button onClick={() => confirmDelivery(order.id)} className="rounded-full bg-[#0b132b] px-4 py-2 text-sm font-bold text-white">تأكيد الاستلام</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
