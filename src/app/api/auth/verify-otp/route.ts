import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp, consumeOtp, readOtpRecords } from '../../../../lib/otp';
import { findUserByEmail } from '../../../../lib/auth';
import { signSessionToken, sanitizeUser } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const code = String(body.code || '').trim();
    const type = String(body.type || 'general');

    if (!email || !code) {
      return NextResponse.json({ message: 'البريد والرمز مطلوبان' }, { status: 400 });
    }

    let resolvedEmail = email;
    let isValid = await verifyOtp(resolvedEmail, code);

    // If not valid and the provided email looks masked (contains '***'), try to resolve by code
    if (!isValid && resolvedEmail.includes('***')) {
      const records = await readOtpRecords();
      const match = records.find((r) => r.code === code && Date.now() <= r.expiresAt);
      if (match) {
        resolvedEmail = match.email;
        isValid = true;
      }
    }

    if (!isValid) {
      return NextResponse.json({ message: 'رمز التحقق غير صحيح أو منتهي الصلاحية' }, { status: 401 });
    }

    // For registration verification, mark user verified and sign session
    if (type === 'register') {
      const user = await findUserByEmail(resolvedEmail);
      if (!user) return NextResponse.json({ message: 'المستخدم غير موجود' }, { status: 404 });

      // update user to verified
      const auth = await import('../../../../lib/auth');
      const users = await auth.readUsers();
      const idx = users.findIndex((u: { email: string }) => u.email.toLowerCase() === resolvedEmail);
      if (idx !== -1) {
        users[idx].isVerified = true;
        await auth.writeUsers(users);
      }

      await consumeOtp(resolvedEmail);

      if (idx === -1) {
        return NextResponse.json({ message: 'المستخدم غير موجود' }, { status: 404 });
      }

      const safe = sanitizeUser(users[idx]);
      const token = signSessionToken(safe);
      const response = NextResponse.json({ message: 'تم التحقق وتفعيل الحساب', user: safe });
      response.cookies.set({ name: 'hoor_token', value: token, httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
      return response;
    }

    // Reset verification is intentionally not consumed here because the reset-password API
    // will consume it only after the password is successfully updated.
    if (type === 'general') {
      await consumeOtp(resolvedEmail);
    }

    return NextResponse.json({ message: 'تم التحقق بنجاح', verified: true });
  } catch (error) {
    console.error('verify-otp error:', error);
    return NextResponse.json({ message: 'خطأ في النظام' }, { status: 500 });
  }
}
