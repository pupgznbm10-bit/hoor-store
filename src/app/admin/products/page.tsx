import React from 'react';
import ProductListClient from './ProductListClient';

export const metadata = {
  title: '·ÊÕ… «· Õﬂ„ - «œ«—… «·„‰ Ã« ',
};

export default function AdminProductsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">≈œ«—… «·„‰ Ã« </h1>
      <ProductListClient />
    </div>
  );
}
