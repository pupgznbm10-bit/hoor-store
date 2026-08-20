'use client';
import React from 'react';

export default function ConfirmModal({ open, title, description, onConfirm, onCancel }: {
  open: boolean;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-lg animate-fade-in">
        <h3 className="text-lg font-bold mb-2">{title || 'تأكيد'}</h3>
        <p className="text-sm text-slate-600 mb-4">{description || 'هل أنت متأكد من المتابعة؟'}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded border">إلغاء</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 text-white">حذف</button>
        </div>
      </div>
    </div>
  );
}
