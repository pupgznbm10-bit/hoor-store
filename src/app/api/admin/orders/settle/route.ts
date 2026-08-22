import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromRequest, isAdminUser } from '../../../../../lib/auth';
import { settleOrders } from '../../../../../lib/orders';

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildReport(orders: Awaited<ReturnType<typeof settleOrders>>) {
  const rows = orders.orders.map((order) => `
    <tr>
      <td>${escapeHtml(order.id)}</td>
      <td>${escapeHtml(order.fullName)}</td>
      <td>${escapeHtml(order.phone)}</td>
      <td>${escapeHtml(order.city)} - ${escapeHtml(order.address)}</td>
      <td>${Number(order.total || 0).toLocaleString('ar-EG')} ج.م</td>
      <td>${order.status === 'Delivered' || order.revenueReleased ? 'مستلمة' : 'غير مستلمة'}</td>
      <td>${new Date(order.createdAt).toLocaleDateString('ar-EG')}</td>
    </tr>`).join('');

  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>كشف حساب متجر حور</title>
    <style>body{font-family:Arial,sans-serif;color:#111827;padding:28px}h1{color:#8a5f00}p{font-size:16px}.summary{font-size:20px;font-weight:bold;margin:20px 0}table{border-collapse:collapse;width:100%;font-size:13px}th{background:#111827;color:#fff}th,td{border:1px solid #d1d5db;padding:10px;text-align:right}tr:nth-child(even){background:#f8fafc}@media print{button{display:none}}</style>
    </head><body><h1>كشف حساب متجر حور</h1><p>تاريخ التصفية: ${escapeHtml(new Date().toLocaleString('ar-EG'))}</p>
    <div class="summary">إجمالي الإيرادات المستلمة: ${orders.releasedRevenue.toLocaleString('ar-EG')} ج.م</div>
    <table><thead><tr><th>رقم الطلب</th><th>العميل</th><th>الهاتف</th><th>العنوان</th><th>الإجمالي</th><th>حالة الإيراد</th><th>التاريخ</th></tr></thead><tbody>${rows || '<tr><td colspan="7">لا توجد طلبات</td></tr>'}</tbody></table></body></html>`;
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUserFromRequest(request);
  if (!user || !isAdminUser(user)) {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
  }

  try {
    const settled = await settleOrders();
    return NextResponse.json({ report: buildReport(settled), releasedRevenue: settled.releasedRevenue });
  } catch (error) {
    console.error('settle orders error', error);
    return NextResponse.json({ message: 'تعذر إنشاء كشف الحساب' }, { status: 500 });
  }
}