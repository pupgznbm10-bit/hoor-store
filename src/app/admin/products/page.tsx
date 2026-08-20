'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductListClient from './ProductListClient';
import { useAuth } from '../../../context/AuthContext';

export default function AdminProductsPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace('/auth/login');
    }
  }, [user, loading, isAdmin, router]);

  if (loading || !user || !isAdmin) {
    return <div className="p-6">جارٍ التحقق من الصلاحيات...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">إدارة المنتجات</h1>
      <ProductListClient />
    </div>
  );
}
