'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type User = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  address?: string;
  role?: string;
  createdAt?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  register: (payload: { fullName: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  login: (payload: { email: string; password: string; remember?: boolean }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile?: (payload: { fullName?: string; phone?: string; city?: string; address?: string }) => Promise<{ success: boolean; user?: User }>; 
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const isAdmin = !!user && String(user.role || '').toLowerCase() === 'admin';

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        const data = await res.json();
        if (res.ok && data.user) {
          setUser(data.user);
          localStorage.setItem('hoor_user_v1', JSON.stringify(data.user));
        } else {
          setUser(null);
          localStorage.removeItem('hoor_user_v1');
        }
      } catch (error) {
        console.warn('failed to load authenticated user', error);
        setUser(null);
        localStorage.removeItem('hoor_user_v1');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const persist = (u: User | null) => {
    try {
      if (u) localStorage.setItem('hoor_user_v1', JSON.stringify(u));
      else localStorage.removeItem('hoor_user_v1');
    } catch (e) {
      console.warn('persist user failed', e);
    }
  };

  const updateProfile = async (payload: { fullName?: string; phone?: string; city?: string; address?: string }) => {
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, user: undefined };
      setUser(data.user);
      persist(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      console.error('updateProfile error', err);
      return { success: false, user: undefined };
    }
  };

  const register = async (payload: { fullName: string; email: string; phone: string; password: string }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message };
      // If registration is pending email verification, redirect user to verify page
      if (data.pending) {
        toast.success('تم إنشاء الحساب. يرجى التحقق من بريدك الإلكتروني');
        // persist pending email locally so verify page can use it
        try { localStorage.setItem('pending_verification_email', String(payload.email || '')); } catch(e) {}
        // prefer server-provided raw email if present
        const redirectEmail = data.emailRaw || payload.email || '';
        try { window.location.href = `/auth/verify-email?email=${encodeURIComponent(String(redirectEmail))}`; } catch (e) {}
        return { success: true };
      }

      setUser(data.user);
      persist(data.user);
      toast.success('تم إنشاء الحساب بنجاح', { description: 'مرحبًا بك في متجر حور' });
      return { success: true };
    } catch (err) {
      console.error('register error', err);
      return { success: false, message: 'خطأ في الشبكة' };
    }
  };

  const login = async (payload: { email: string; password: string; remember?: boolean }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: payload.email, password: payload.password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message };
      setUser(data.user);
      persist(data.user);
      toast.success('تم تسجيل الدخول بنجاح', { description: `مرحبًا ${data.user.fullName}` });
      return { success: true };
    } catch (err) {
      console.error('login error', err);
      return { success: false, message: 'خطأ في الشبكة' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('تم تسجيل الخروج بنجاح', { description: 'سيتم إعادة توجيهك إلى الصفحة الرئيسية' });
    } catch (error) {
      console.warn('logout request failed', error);
      toast.error('فشل تسجيل الخروج', { description: 'حاول مرة أخرى' });
    } finally {
      setUser(null);
      persist(null);
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, register, login, logout, updateProfile }}>{children}</AuthContext.Provider>
  );
};
