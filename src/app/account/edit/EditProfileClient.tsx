'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '../../../context/AuthContext';

export default function EditProfileClient({ user }: { user: any }) {
  const router = useRouter();
  const { updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [address, setAddress] = useState(user?.address || '');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { fullName, phone, city, address };
      if (updateProfile) {
        const res = await updateProfile(payload);
        if (!res.success) throw new Error('فشل التحديث');
      } else {
        const r = await fetch('/api/auth/update-profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!r.ok) throw new Error('فشل التحديث');
      }
      toast.success('تم تحديث البيانات');
      router.push('/account');
    } catch (err) {
      console.error(err);
      toast.error('فشل تحديث البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-[20px] bg-white p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-bold">تعديل بيانات الحساب</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm">الاسم الكامل</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full mt-1 rounded-2xl border px-4 py-2" />
          </div>
          <div>
            <label className="text-sm">البريد الإلكتروني (لا يمكن تغييره)</label>
            <input value={user?.email || ''} disabled className="w-full mt-1 rounded-2xl border px-4 py-2 bg-slate-100" />
          </div>
          <div>
            <label className="text-sm">رقم الهاتف</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full mt-1 rounded-2xl border px-4 py-2" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm">المدينة</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full mt-1 rounded-2xl border px-4 py-2" />
            </div>
            <div>
              <label className="text-sm">العنوان التفصيلي</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full mt-1 rounded-2xl border px-4 py-2" />
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="rounded-full bg-[#d4af37] px-6 py-2 text-white font-bold">{loading ? 'جارٍ...' : 'حفظ التغييرات'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
