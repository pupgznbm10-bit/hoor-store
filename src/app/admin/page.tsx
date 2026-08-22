'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, PackageCheck, Truck, CheckCircle2, Wallet, ShoppingCart, TrendingUp, FileSpreadsheet, Plus, ClipboardList, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ProductListClient from './products/ProductListClient';
import OrderCreatorClient from './OrderCreatorClient';

const statusOptions = ['Pending', 'Shipped', 'Delivered'] as const;

type Order = {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  address: string;
  total: number;
  paymentMethod: string;
  status: (typeof statusOptions)[number];
  createdAt: string;
  deliveryEstimate?: string;
  shippedAt?: string;
  deliveredAt?: string;
  revenueReleased?: boolean;
};

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [estimateMap, setEstimateMap] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [settling, setSettling] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.replace('/');
    }
  }, [authLoading, user, isAdmin, router]);

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      const data = await res.json();
      setOrders(data.orders ?? []);
    } catch (err) {
      console.error('loadOrders error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      const refreshTimer = window.setTimeout(() => { void loadOrders(); }, 0);
      return () => window.clearTimeout(refreshTimer);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    const handler = () => {
      // refresh data when orders or products updated
      if (activeTab === 'orders' && user && isAdmin) loadOrders();
    };
    window.addEventListener('orders:updated', handler);
    window.addEventListener('products:updated', handler);
    return () => { window.removeEventListener('orders:updated', handler); window.removeEventListener('products:updated', handler); };
  }, [activeTab, user, isAdmin]);

  const updateStatus = async (orderId: string, status: (typeof statusOptions)[number]) => {
    setUpdatingId(orderId);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      await loadOrders();
    }
    setUpdatingId(null);
  };

  const shipOrder = async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      const estimate = (estimateMap[orderId] || '').trim();
      const res = await fetch(`/api/admin/orders/${orderId}/ship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estimate }),
      });
      if (res.ok) {
        await loadOrders();
      } else {
        console.error('shipOrder failed');
      }
    } catch (err) {
      console.error('shipOrder error', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const onEstimateChange = (orderId: string, value: string) => {
    setEstimateMap((m) => ({ ...m, [orderId]: value }));
  };

  const settleAccount = async () => {
    if (!window.confirm('سيتم إنشاء كشف الحساب ثم حذف الطلبات الحالية والإيرادات من اللوحة. هل تريد المتابعة؟')) return;
    setSettling(true);
    try {
      const res = await fetch('/api/admin/orders/settle', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'تعذر تصفية الحساب');

      const reportWindow = window.open('', '_blank', 'noopener,noreferrer');
      if (reportWindow) {
        reportWindow.document.write(data.report);
        reportWindow.document.close();
        reportWindow.focus();
        reportWindow.print();
      }

      const blob = new Blob([`\uFEFF${data.report}`], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hoor-account-${new Date().toISOString().slice(0, 10)}.xls`;
      link.click();
      URL.revokeObjectURL(url);
      setOrders([]);
      alert('تم تصفية الحساب وتنزيل كشف Excel وفتح نافذة الطباعة.');
    } catch (error) {
      console.error('settleAccount error', error);
      alert('تعذر تصفية الحساب');
    } finally {
      setSettling(false);
    }
  };

  const stats = useMemo(() => {
    const totalRevenue = orders
      .filter((order) => order.status === 'Delivered' || order.revenueReleased)
      .reduce((sum, order) => sum + Number(order.total || 0), 0);
    const pending = orders.filter((o) => o.status === 'Pending').length;
    const shipped = orders.filter((o) => o.status === 'Shipped').length;
    const delivered = orders.filter((o) => o.status === 'Delivered').length;

    return {
      totalOrders: orders.length,
      totalRevenue,
      pending,
      shipped,
      delivered,
    };
  }, [orders]);

  if (authLoading || !user || !isAdmin) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center text-slate-500">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[#d4af37]" />
        جاري التحقق من الصلاحيات...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center text-slate-500">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[#d4af37]" />
        جاري تحميل الطلبات...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#a67c00]">لوحة التحكم</p>
          <h1 className="mt-2 text-3xl font-black text-[#111827]">{activeTab === 'orders' ? 'إدارة الطلبات' : 'إدارة المنتجات'}</h1>
        </div>
        <div className="rounded-full border border-[#efe5d4] bg-[#fffaf0] px-4 py-2 text-sm font-bold text-[#8a5f00]">
          المدير: {user.email}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`admin-action-button group inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-black ${activeTab === 'orders' ? 'border-[#c99b24] bg-gradient-to-l from-[#9b6d00] via-[#c99b24] to-[#e2bd55] text-white shadow-[0_10px_24px_rgba(166,124,0,0.25)]' : 'border-slate-200 bg-white text-slate-700 shadow-sm hover:border-[#d4af37] hover:text-[#8a5f00]'}`}
        >
          <ClipboardList size={17} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
          إدارة الطلبات
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`admin-action-button group inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-black ${activeTab === 'products' ? 'border-[#17356a] bg-gradient-to-l from-[#0b132b] via-[#17356a] to-[#2867a8] text-white shadow-[0_10px_24px_rgba(11,19,43,0.22)]' : 'border-slate-200 bg-white text-slate-700 shadow-sm hover:border-[#2867a8] hover:text-[#17356a]'}`}
        >
          <Package size={17} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
          إدارة المنتجات
        </button>
      </div>

      {activeTab === 'orders' ? (
        <>
          <div className="mb-8 flex items-center justify-between">
            <div className="grid gap-4 md:grid-cols-4 w-full">
              {[
                { label: 'إجمالي الطلبات', value: stats.totalOrders, icon: ShoppingCart, accent: 'text-[#111827]' },
                { label: 'إجمالي الإيرادات', value: `${stats.totalRevenue.toLocaleString()} ج.م`, icon: Wallet, accent: 'text-[#a67c00]' },
                { label: 'قيد التنفيذ', value: stats.pending, icon: PackageCheck, accent: 'text-[#d97706]' },
                { label: 'تم التوصيل', value: stats.delivered, icon: TrendingUp, accent: 'text-[#16a34a]' },
              ].map(({ label, value, icon: Icon, accent }) => (
                <div key={label} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.04)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-slate-500">{label}</div>
                      <div className={`mt-3 text-2xl font-black ${accent}`}>{value}</div>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff7df] text-[#a67c00]">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="ml-4 flex shrink-0 flex-wrap justify-end gap-2">
              <button onClick={settleAccount} disabled={settling || orders.length === 0} className="admin-action-button group inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[#9b6d00] via-[#c99b24] to-[#e2bd55] px-4 py-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(166,124,0,0.28)] disabled:cursor-not-allowed disabled:opacity-50">
                <FileSpreadsheet size={17} className="transition-transform duration-300 group-hover:rotate-6" />
                {settling ? 'جاري التصفية...' : 'تصفية الحساب'}
              </button>
              <button onClick={() => setShowCreateOrder(true)} className="admin-action-button inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[#0b132b] via-[#17356a] to-[#2867a8] px-4 py-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(11,19,43,0.25)]">
                <Plus size={18} />
                إضافة طلب جديد
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-right">
                <thead className="bg-slate-100 text-sm text-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-bold">Order ID</th>
                    <th className="px-4 py-3 font-bold">Customer</th>
                    <th className="px-4 py-3 font-bold">Phone</th>
                    <th className="px-4 py-3 font-bold">Address</th>
                    <th className="px-4 py-3 font-bold">Total</th>
                    <th className="px-4 py-3 font-bold">Payment</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    لا توجد طلبات حتى الآن
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-t border-slate-200 align-top">
                    <td className="px-4 py-4 text-sm font-bold text-slate-800">{order.id}</td>
                    <td className="px-4 py-4 text-sm">
                      <div className="font-bold text-[#111827]">{order.fullName}</div>
                      <div className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">{order.phone}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      <div>{order.city}</div>
                      <div className="text-xs text-slate-500">{order.address}</div>
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-[#111827]">{order.total.toLocaleString()} ج.م</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{order.paymentMethod}</td>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value as (typeof statusOptions)[number])}
                          disabled={updatingId === order.id}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-[#d4af37]"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status === 'Pending' ? 'قيد الانتظار' : status === 'Shipped' ? 'تم الشحن' : 'تم الاستلام'}
                            </option>
                          ))}
                        </select>

                        {order.status === 'Pending' && <PackageCheck className="h-4 w-4 text-amber-500" />}
                        {order.status === 'Shipped' && <Truck className="h-4 w-4 text-blue-500" />}
                        {order.status === 'Delivered' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                      </div>

                      {/* Shipping controls: ETA input + Mark as Shipped button */}
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          placeholder="موعد/مدة التوصيل (مثال: 2 أيام أو 3 ساعات)"
                          value={estimateMap[order.id] || order.deliveryEstimate || ''}
                          onChange={(e) => onEstimateChange(order.id, e.target.value)}
                          className="w-[220px] rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none"
                        />
                        <button
                          onClick={() => shipOrder(order.id)}
                          disabled={updatingId === order.id}
                          className="rounded-full bg-[#0b132b] px-3 py-2 text-xs font-bold text-white transition hover:opacity-90"
                        >
                          {updatingId === order.id ? 'جاري...' : 'تمييز كشحن'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Orders modal */}
      {showCreateOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-w-3xl w-full p-6">
            <div className="rounded-lg bg-white p-4 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">إنشاء طلب جديد</h3>
                <button onClick={() => setShowCreateOrder(false)} className="text-slate-500">إلغاء</button>
              </div>
              <OrderCreatorClient
                onClose={() => {
                  setShowCreateOrder(false);
                  loadOrders();
                }}
                onCreated={() => loadOrders()}
              />
            </div>
          </div>
        </div>
      )}
        </>
      ) : (
        <div>
          <ProductListClient />
        </div>
      )}

    </div>
  );
}
