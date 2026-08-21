'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ResetPasswordClient() {
  const search = useSearchParams();
  const router = useRouter();

  const queryEmail = search?.get('email') || '';
  const queryCode = search?.get('code') || '';
  const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('hoor_reset_email') || '' : '';
  const storedCode = typeof window !== 'undefined' ? localStorage.getItem('hoor_reset_code') || '' : '';

  const email = queryEmail || storedEmail;
  const code = queryCode || storedCode;

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !code) {
      return toast.error('انتهت الجلسة أو تم فقدان رمز التحقق. يرجع وإعادة إرسال الرمز من جديد.');
    }
    if (!password || !confirm) return toast.error('جميع الحقول مطلوبة');
    if (password.length < 6) return toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    if (password !== confirm) return toast.error('كلمتا المرور غير متطابقتين');

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code, newPassword: password }) });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'فشل إعادة تعيين كلمة المرور');

      localStorage.removeItem('hoor_reset_email');
      localStorage.removeItem('hoor_reset_code');

      if (data.user) {
        localStorage.setItem('hoor_user_v1', JSON.stringify(data.user));
      }

      toast.success('تم تحديث كلمة المرور وتم تسجيل الدخول تلقائيًا');
      router.push('/');
    } catch (err) {
      console.error(err);
      toast.error('خطأ في الشبكة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white p-6 rounded-lg shadow-md" style={{ borderTop: '4px solid #0B132B' }}>
        <h1 className="text-2xl font-bold mb-4">إعادة تعيين كلمة المرور</h1>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-sm">البريد الإلكتروني</label>
            <input type="email" value={email} readOnly className="w-full mt-1 px-3 py-2 border rounded bg-slate-50" />
          </div>

          <div>
            <label className="text-sm">كلمة المرور الجديدة</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="text-sm">تأكيد كلمة المرور</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded" />
          </div>

          <div className="pt-4">
            <button type="submit" disabled={loading} className="w-full py-3 bg-[#D4AF37] text-white rounded font-semibold">{loading ? 'جارٍ...' : 'إعادة التعيين'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
