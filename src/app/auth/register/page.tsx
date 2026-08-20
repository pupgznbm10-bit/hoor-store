'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../../src/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.fullName || !form.email || !form.phone || !form.password) return setError('يرجى تعبئة جميع الحقول');
    if (form.password !== form.confirm) return setError('كلمتا المرور غير متطابقتين');
    setLoading(true);
    const res = await register({ fullName: form.fullName, email: form.email, phone: form.phone, password: form.password });
    setLoading(false);
    if (!res.success) return setError(res.message || 'خطأ في التسجيل');
    router.push('/');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">إنشاء حساب جديد</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-sm">الاسم الكامل</label>
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="text-sm">البريد الإلكتروني</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="text-sm">رقم الهاتف</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="text-sm">كلمة المرور</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="text-sm">تأكيد كلمة المرور</label>
            <input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded" />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="pt-4">
            <button type="submit" disabled={loading} className="w-full py-3 bg-gold text-white rounded font-semibold">{loading ? 'جاري الإنشاء...' : 'إنشاء حساب جديد'}</button>
          </div>

          <div className="text-sm text-center">
            لديك حساب؟ <a href="/auth/login" className="text-gold">تسجيل الدخول</a>
          </div>
        </form>
      </div>
    </div>
  );
}
