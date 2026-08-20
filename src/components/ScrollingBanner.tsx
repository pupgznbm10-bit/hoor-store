'use client';

import React from 'react';

interface ScrollingBannerProps {
  text: string;
  speed?: number;
}

export default function ScrollingBanner({ text, speed = 25 }: ScrollingBannerProps) {
  return (
    <div className="scrolling-text-container py-3 px-4">
      <div className="scrolling-text" style={{ animationDuration: `${speed}s` }}>
        <span className="inline-block px-8 text-gold-500 font-semibold">
          ✨ {text}
        </span>
        <span className="inline-block px-8 text-gold-500 font-semibold">
          ✨ {text}
        </span>
        <span className="inline-block px-8 text-gold-500 font-semibold">
          ✨ {text}
        </span>
      </div>
    </div>
  );
}
