'use client';

import React, { useRef, useEffect } from 'react';

export default function DraggableModal({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let isDown = false;
    let startX = 0;
    let startY = 0;

    const modalElement = element;

    function onDown(e: MouseEvent) {
      isDown = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = modalElement.getBoundingClientRect();
      void rect;
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    }

    function onMove(e: MouseEvent) {
      if (!isDown) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      modalElement.style.transform = `translate(${dx}px, ${dy}px)`;
    }

    function onUp() {
      isDown = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      setTimeout(() => {
        modalElement.style.transform = '';
      }, 300);
    }

    modalElement.addEventListener('mousedown', onDown);
    return () => {
      modalElement.removeEventListener('mousedown', onDown);
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