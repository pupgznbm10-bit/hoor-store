'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Heart, ShoppingCart, User, Filter, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '../context/StoreProvider';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

/**
 * Header / Navbar component
 * Arabic (RTL) first. Mobile-first responsive design.
 * Contains: announcement bar, glassmorphic sticky navbar, live search, action icons.
 */

const defaultMap: Record<string, string> = {
  men: 'عطور رجالية',
  women: 'عطور نسائية',
  oriental: 'عطور شرقية وعود',
  samples: 'عينات وتجارب',
  bestsellers: 'الأكثر مبيعاً',
};


export default function Header() {
  const { wishlist } = useStore();
  const { cartCount, toggleCart: openCart } = useCart();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [categories, setCategories] = useState<{ label: string; href: string }[]>(
    Object.keys(defaultMap).map((k) => ({ label: defaultMap[k], href: `/category/${encodeURIComponent(k)}` }))
  );

  useEffect(() => {
    let mounted = true;
    async function loadMeta() {
      try {
        const res = await fetch('/api/products/meta');
        const data = await res.json();
        const cats: string[] = data.categories || [];
        const mapped = cats.map((c: string) => ({ label: defaultMap[c] || c, href: `/category/${encodeURIComponent(c)}` }));
        if (mounted && mapped.length) setCategories(mapped);
      } catch (err) {
        // keep defaults
        console.error('failed to load categories meta', err);
      }
    }
    loadMeta();
    const handler = () => loadMeta();
    window.addEventListener('products:updated', handler);

    // SSE fallback: connect to server-sent events and re-dispatch as window events
    let es: EventSource | null = null;
    try {
      if (typeof window !== 'undefined' && 'EventSource' in window) {
        es = new EventSource('/api/products?sse=1');
        es.onmessage = (e) => {
          try {
            const parsed = JSON.parse(e.data);
            if (parsed && parsed.type) {
              window.dispatchEvent(new CustomEvent(parsed.type, { detail: parsed.payload }));
            }
          } catch (err) {
            // ignore
          }
        };
        es.onerror = () => {
          // close and cleanup on error
          try { es && es.close(); } catch(e){}
          es = null;
        };
      }
    } catch (e) {
      // ignore
    }

    return () => { mounted = false; window.removeEventListener('products:updated', handler); if (es) try { es.close(); } catch(e){} };
  }, []);

  // Simulated suggestions. Replace with live API later.
  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    const all = [
      'عطر روز الذهب',
      'عود الملكي',
      'نسيم المساء',
      'سكينة الغروب',
      'حور كلاسيك 100ml',
    ];
    setSuggestions(all.filter((s) => s.includes(query)).slice(0, 5));
  }, [query]);

  // Close suggestions on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!inputRef.current) return;
      if (!(e.target instanceof Node) || inputRef.current.contains(e.target)) return;
      setShowSuggestions(false);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <header className="w-full overflow-x-hidden">
      <div className="bg-ivory border-b border-slate-100 text-sm text-mutedGoldGray">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:px-4">
          <div className="truncate text-xs text-charcoalText/80 sm:text-sm">شحن مجاني للطلبات الأكبر من 300 جنيه — توصيل سريع وفاخر</div>
          <div className="hidden sm:flex gap-4 text-sm text-charcoalText/70">
            <Link href="/support" className="hover:text-charcoalText">خدمة العملاء</Link>
            <Link href="/faq" className="hover:text-charcoalText">الأسئلة الشائعة</Link>
            <Link href="/about" className="hover:text-charcoalText">من نحن</Link>
            <Link href="/contact" className="hover:text-charcoalText">التواصل</Link>
          </div>
        </div>
      </div>

      <nav className="sticky top-0 z-50 border-b border-slate-200/10 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-2 py-2 sm:px-4 sm:py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
              <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#e9d79e] bg-white shadow-[0_6px_20px_rgba(212,175,55,0.18)] sm:h-12 sm:w-12">
                  <img src="/hoor-logo.jfif" alt="شعار متجر حور" className="h-full w-full object-cover" />
                </div>
                <div className="leading-tight">
                  <div className="text-lg font-extrabold text-charcoalText">حور</div>
                  <div className="text-[10px] text-gold">HOOR</div>
                </div>
              </Link>

              <ul className="hidden lg:flex items-center gap-2 mx-4">
                {categories.map((c) => (
                  <li key={c.href} className="rounded-md px-2 py-1.5 text-sm text-charcoalText/80 transition hover:text-charcoalText/100">
                    <Link href={c.href}>{c.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link href="/products" aria-label="بحث" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm sm:hidden">
                <Search size={18} />
              </Link>

              <Link href="/advisor" className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[#efe2c2] bg-[#fffaf0] px-2.5 py-2 text-sm font-medium text-[#3a2b12] transition hover:bg-[#fff4da]">
                <Filter size={15} />
                <span>مستشار العطور</span>
              </Link>

              <Link href="/favorites" className="relative rounded-full p-2.5 text-[#1f2937] transition hover:bg-slate-100">
                <Heart size={18} className={Array.from(wishlist || new Set()).length > 0 ? 'fill-red-500 text-red-500' : ''} />
                {Array.from(wishlist || new Set()).length > 0 && (
                  <span className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#d4af37] text-[10px] font-bold text-white glow-pulse">{Array.from(wishlist).length}</span>
                )}
              </Link>

              <button
                aria-label="سلة التسوق"
                onClick={openCart}
                className="relative rounded-full p-2.5 text-[#1f2937] transition hover:bg-slate-100"
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#d4af37] text-[10px] font-bold text-white glow-pulse">{cartCount}</span>
                )}
              </button>

              {user ? (
                <div className="flex items-center gap-1.5 rounded-full border border-[#eadab0] bg-[#fffdf8] px-1.5 py-1 shadow-sm sm:gap-2 sm:px-2">
                  <Link href="/account" className="flex items-center gap-2 text-sm font-medium text-[#1f2937]">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1c1c1c] text-[10px] font-bold text-white sm:h-8 sm:w-8">
                      {user.fullName?.slice(0, 1) || 'U'}
                    </span>
                    <span className="hidden md:inline">{user.fullName.split(' ')[0]}</span>
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="rounded-full p-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-[#8a5f00]"
                    aria-label="تسجيل الخروج"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <Link href="/auth/login" className="flex items-center gap-1.5 rounded-full bg-[#d4af37] px-3 py-2 text-xs font-bold text-white shadow-md transition hover:bg-[#c79d1e] sm:gap-2 sm:px-4 sm:text-sm">
                  <User size={15} />
                  <span>تسجيل الدخول</span>
                </Link>
              )}
            </div>
          </div>

          <div className="mt-2 hidden sm:block">
            <div className="relative mx-auto max-w-2xl">
              <label htmlFor="search" className="sr-only">بحث عن العطور</label>
              <div className="flex items-center overflow-hidden rounded-full border border-slate-100 bg-white shadow-sm">
                <input
                  ref={inputRef}
                  id="search"
                  value={query}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث عن اسم العطر، نغمات، أو مجموعة"
                  className="flex-1 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none"
                  aria-label="بحث عن العطور"
                />
                <button aria-label="ابحث" className="border-l border-slate-100 px-4 py-2.5 text-slate-600">
                  <Search size={16} />
                </button>
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute right-0 left-0 z-40 mt-2 overflow-hidden rounded-lg border bg-white shadow-lg">
                  <ul>
                    {suggestions.map((s) => (
                      <li key={s} className="cursor-pointer px-4 py-3 text-sm hover:bg-slate-50">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
