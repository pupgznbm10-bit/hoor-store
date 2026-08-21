import '../styles/globals.css';
import type { Metadata } from 'next';
import React from 'react';
import { StoreProvider } from '../context/StoreProvider';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import ToastProvider from '../components/ToastProvider';

export const metadata: Metadata = {
  title: 'متجر حور | HOOR',
  description: 'بوتيك عطور فاخرة - متجر حور',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="overflow-x-hidden">
        <StoreProvider>
          <AuthProvider>
            <CartProvider>
              <Header />

              <main className="min-h-screen overflow-x-hidden bg-ivory text-charcoalText">{children}</main>

              <Footer />
              <ToastProvider />

              {/* Global cart drawer placed here so it's available app-wide */}
              <CartDrawer />
            </CartProvider>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
