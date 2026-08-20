'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Basic types for cart and wishlist. Extend as needed.
export type CartItem = {
  id: string;
  name_ar: string;
  name_en?: string;
  price: number;
  quantity: number;
  volume?: string; // e.g., "50ml"
  image?: string;
};

type StoreContextType = {
  // Cart
  cart: CartItem[];
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  cartCount: number;
  cartSubtotal: number;
  // Wishlist
  wishlist: Set<string>;
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = (): StoreContextType => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem('hoor_wishlist_v1');
      if (stored) {
        setWishlist(new Set(JSON.parse(stored)));
      }
    } catch (error) {
      console.warn('wishlist hydration failed', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('hoor_wishlist_v1', JSON.stringify(Array.from(wishlist)));
    } catch (error) {
      console.warn('wishlist save failed', error);
    }
  }, [wishlist]);

  const openCart = () => setCartOpen(true);
  const closeCart = () => setCartOpen(false);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.id === item.id && p.volume === item.volume);
      if (exists) {
        return prev.map((p) =>
          p.id === item.id && p.volume === item.volume ? { ...p, quantity: p.quantity + item.quantity } : p
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((p) => p.id !== id));

  const updateQuantity = (id: string, qty: number) =>
    setCart((prev) => prev.map((p) => (p.id === id ? { ...p, quantity: Math.max(1, qty) } : p)));

  const cartCount = cart.reduce((s, it) => s + it.quantity, 0);
  const cartSubtotal = cart.reduce((s, it) => s + it.price * it.quantity, 0);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  const isWishlisted = (id: string) => wishlist.has(id);

  return (
    <StoreContext.Provider
      value={{
        cart,
        cartOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        cartCount,
        cartSubtotal,
        wishlist,
        toggleWishlist,
        isWishlisted,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
