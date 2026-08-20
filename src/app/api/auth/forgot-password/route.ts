import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '../../../../lib/auth';
import { createOtp } from '../../../../lib/otp';
import { sendOtpEmail } from '../../../../lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ message: 'البريد الإلكتروني مطلوب' }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ message: 'المستخدم غير موجود' }, { status: 404 });
    }

    const otp = await createOtp(email);

    try {
      await sendOtpEmail(email, otp, 'reset');
    } catch (e) {
      console.error('sendOtpEmail failed', e);
      // continue — OTP is still stored
    }

    return NextResponse.json({
      message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
      email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
    });
  } catch (error) {
    console.error('forgot-password error:', error);
    return NextResponse.json({ message: 'خطأ في النظام' }, { status: 500 });
  }
}
