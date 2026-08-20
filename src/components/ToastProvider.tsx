'use client';

import { Toaster } from 'sonner';

export default function ToastProvider() {
  return (
    <Toaster
      richColors
      position="top-left"
      theme="dark"
      toastOptions={{
        style: {
          background: 'rgba(15, 23, 42, 0.96)',
          border: '1px solid rgba(212, 175, 55, 0.32)',
          color: '#f8fafc',
          boxShadow: '0 18px 45px rgba(15, 23, 42, 0.34)',
          borderRadius: '14px',
        },
        classNames: {
          title: 'font-bold text-sm',
          description: 'text-xs text-slate-300',
          closeButton: 'border-slate-700 bg-slate-900 text-slate-200',
        },
      }}
    />
  );
}
