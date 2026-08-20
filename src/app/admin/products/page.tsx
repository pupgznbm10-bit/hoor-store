'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductListClient from './ProductListClient';
import { useAuth } from '../../../context/AuthContext';

export const metadata = {
  title: '·ÊÕ… «· Õﬂ„ - «œ«—… «·„‰ Ã« ',
};

export default function AdminProductsPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace('/auth/login');
    }
  }, [user, loading, isAdmin, router]);

  if (loading || !user || !isAdmin) {
    return <div className="p-6">Ã«—Ú «· Õﬁﬁ „‰ «·’·«ÕÌ« ...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">≈œ«—… «·„‰ Ã« </h1>
      <ProductListClient />
    </div>
  );
}
