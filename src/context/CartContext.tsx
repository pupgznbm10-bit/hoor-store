'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';

export type CartItem = {
  id: string;
  title: string;
  volume: string; // '50ml' | '100ml' | 'Sample'
  price: number;
  quantity: number;
  image?: string;
};

type CartContextType = {
  cartItems: CartItem[];
  isCartOpen: boolean;
  freeShippingThreshold: number;
  subtotal: number;
  cartCount: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, volume?: string) => void;
  updateQuantity: (id: string, volume: string | undefined, qty: number) => void;
  toggleCart: () => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => { success: boolean; discountAmount: number };
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const freeShippingThreshold = 300; // EGP
  const [promo, setPromo] = useState<{ code: string; amount: number } | null>(null);

  // hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('hoor_cart_v1');
      if (raw) setCartItems(JSON.parse(raw));
    } catch (e) {
      console.warn('Failed to read cart from localStorage', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('hoor_cart_v1', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  const findKey = (id: string, volume?: string) => `${id}::${volume ?? 'default'}`;

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existsIndex = prev.findIndex((p) => p.id === item.id && p.volume === item.volume);
      if (existsIndex !== -1) {
        const copy = [...prev];
        copy[existsIndex] = { ...copy[existsIndex], quantity: copy[existsIndex].quantity + item.quantity };
        return copy;
      }
      return [item, ...prev];
    });

    toast.success('تمت إضافة المنتج إلى السلة', {
      description: `${item.title} (${item.volume}) تم إضافته بنجاح`,
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string, volume?: string) => {
    setCartItems((prev) => prev.filter((p) => !(p.id === id && (volume ? p.volume === volume : true))));
  };

  const updateQuantity = (id: string, volume: string | undefined, qty: number) => {
    setCartItems((prev) =>
      prev.map((p) => (p.id === id && p.volume === (volume ?? p.volume) ? { ...p, quantity: Math.max(1, qty) } : p))
    );
  };

  const toggleCart = () => setIsCartOpen((s) => !s);
  const clearCart = () => {
    setCartItems([]);
    setPromo(null);
  };

  const subtotal = cartItems.reduce((s, it) => s + it.price * it.quantity, 0);
  const cartCount = cartItems.reduce((s, it) => s + it.quantity, 0);

  const applyPromoCode = (code: string) => {
    // simple promo simulation - production should call backend
    const normalized = code.trim().toUpperCase();
    if (normalized === 'HOOR10' && subtotal >= 200) {
      const amount = Math.round(subtotal * 0.1);
      setPromo({ code: normalized, amount });
      return { success: true, discountAmount: amount };
    }
    return { success: false, discountAmount: 0 };
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        freeShippingThreshold,
        subtotal,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleCart,
        clearCart,
        applyPromoCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
