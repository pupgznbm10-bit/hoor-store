import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp, consumeOtp } from '../../../../lib/otp';
import { findUserByEmail, updateUserPassword, sanitizeUser, signSessionToken } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const code = String(body.code || '').trim();
    const newPassword = String(body.newPassword || '');

    if (!email || !code || !newPassword) {
      return NextResponse.json({ message: 'المطلوب: البريد، الرمز، وكلمة المرور الجديدة' }, { status: 400 });
    }

    const isValid = await verifyOtp(email, code);
    if (!isValid) {
      return NextResponse.json({ message: 'رمز التحقق غير صحيح أو منتهي الصلاحية' }, { status: 401 });
    }

    const user = await findUserByEmail(email);
    if (!user) return NextResponse.json({ message: 'المستخدم غير موجود' }, { status: 404 });

    const updated = await updateUserPassword(user.id, newPassword);
    if (!updated) return NextResponse.json({ message: 'فشل تحديث كلمة المرور' }, { status: 500 });

    await consumeOtp(email);

    // Optionally sign user in after reset
    const token = signSessionToken(updated as any);
    const response = NextResponse.json({ message: 'تم تحديث كلمة المرور بنجاح', user: updated });
    response.cookies.set({ name: 'hoor_token', value: token, httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });

    return response;
  } catch (error) {
    console.error('reset-password error:', error);
    return NextResponse.json({ message: 'خطأ في النظام' }, { status: 500 });
  }
}
