'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export default function VerifyEmailClient() {
  const search = useSearchParams();
  const router = useRouter();
  const emailFromQuery = search?.get('email') || '';

  const [email, setEmail] = useState(emailFromQuery);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const [resendCountdown, setResendCountdown] = useState(0);

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code) return toast.error('الرجاء إدخال البريد والرمز');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code, type: 'register' }) });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'رمز غير صحيح');
      toast.success('تم تفعيل الحساب');
      router.push('/');
    } catch (err) {
      console.error(err);
      toast.error('خطأ في الشبكة');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (resendCountdown > 0) return;

    let targetEmail = email;
    if (String(targetEmail).includes('***')) {
      try {
        const stored = localStorage.getItem('pending_verification_email');
        if (stored) targetEmail = stored;
        else return toast.error('الرجاء إدخال بريدك الإلكتروني الكامل لإعادة الإرسال');
      } catch (e) {
        return toast.error('الرجاء إدخال بريدك الإلكتروني الكامل لإعادة الإرسال');
      }
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/resend-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: targetEmail, type: 'register' }) });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'فشل إعادة الإرسال');
      toast.success('تم إعادة إرسال رمز التحقق');
      setResendCountdown(30);
      const t = setInterval(() => {
        setResendCountdown((c) => {
          if (c <= 1) {
            clearInterval(t);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
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
        <h1 className="text-2xl font-bold mb-4">التحقق من البريد الإلكتروني</h1>
        <form onSubmit={verify} className="space-y-3">
          <div>
            <label className="text-sm">البريد الإلكتروني</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="text-sm">رمز التحقق</label>
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} className="w-full mt-1 px-3 py-2 border rounded text-center tracking-widest text-lg" />
          </div>

          <div className="pt-4">
            <button type="submit" disabled={loading} className="w-full py-3 bg-[#D4AF37] text-white rounded font-semibold">{loading ? 'جارٍ...' : 'التحقق'}</button>
          </div>

          <div className="mt-3 text-center">
            <button type="button" onClick={resend} disabled={resendCountdown > 0 || loading} className="text-sm text-[#0B132B] underline">{resendCountdown > 0 ? `إعادة الإرسال بعد ${resendCountdown}s` : 'إعادة إرسال الرمز'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
