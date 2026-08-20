'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../../src/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginClient() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const searchParams = (typeof window !== 'undefined') ? new URLSearchParams(window.location.search) : new URLSearchParams('');
  const redirectTo = searchParams.get('redirect') || '/';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login({ email, password, remember });
    setLoading(false);
    if (!res.success) return setError(res.message || 'فشل تسجيل الدخول');
    router.push(redirectTo);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">تسجيل الدخول</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-sm">البريد الإلكتروني</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="text-sm">كلمة المرور</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded" />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />تذكرني</label>
            <a href="/auth/forgot-password" className="text-gold">نسيت كلمة المرور؟</a>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="pt-4">
            <button type="submit" disabled={loading} className="w-full py-3 bg-gold text-white rounded font-semibold">{loading ? 'جارٍ...' : 'تسجيل الدخول'}</button>
          </div>

          <div className="text-sm text-center">
            ليس لديك حساب؟ <a href="/auth/register" className="text-gold">إنشاء حساب</a>
          </div>
        </form>
      </div>
    </div>
  );
}
