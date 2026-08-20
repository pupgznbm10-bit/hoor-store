'use client';
import React, { useRef, useEffect } from 'react';

export default function DraggableModal({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let isDown = false;
    let startX = 0;
    let startY = 0;
    let origX = 0;
    let origY = 0;

    const header = el;
    function onDown(e: MouseEvent) {
      isDown = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = el.getBoundingClientRect();
      origX = rect.left;
      origY = rect.top;
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    }
    function onMove(e: MouseEvent) {
      if (!isDown) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    }
    function onUp() {
      isDown = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      // reset transform after drop for simplicity
      setTimeout(() => { if (el) el.style.transform = ''; }, 300);
    }

    header.addEventListener('mousedown', onDown);
    return () => {
      header.removeEventListener('mousedown', onDown);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => onClose && onClose()} />
      <div ref={ref} className="relative max-w-3xl w-full bg-white rounded-lg p-4 shadow-lg animate-scale-in">
        {children}
      </div>
    </div>
  );
}
