'use client';

import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function FragranceFinder() {
  return (
    <Link
      href="/advisor"
      className="group inline-flex items-center gap-2 rounded-full bg-[#d4af37] px-5 py-3 text-sm font-black text-white shadow-[0_18px_35px_rgba(212,175,55,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#c79d1e]"
    >
      <Sparkles size={16} className="text-[#fff8dd]" />
      <span>جرّب مستشار العطور</span>
      <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
    </Link>
  );
}
