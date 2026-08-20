import { NextResponse } from 'next/server';
import { createUserRecord } from '../../../../lib/auth';
import { createOtp } from '../../../../lib/otp';
import { sendOtpEmail } from '../../../../lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fullName = String(body?.fullName ?? '').trim();
    const email = String(body?.email ?? '').trim().toLowerCase();
    const phone = String(body?.phone ?? '').trim();
    const password = String(body?.password ?? '');

    if (!fullName || !email || !phone || !password) {
      return NextResponse.json({ message: 'جميع الحقول مطلوبة' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
        { status: 400 }
      );
    }

    let user;
    try {
      user = await createUserRecord({ fullName, email, phone, password });
    } catch (error: any) {
      if (error?.message === 'User already exists.') {
        return NextResponse.json({ message: 'المستخدم موجود بالفعل' }, { status: 409 });
      }

      console.error('Create user failed', error);
      return NextResponse.json({ message: 'حدث خطأ أثناء إنشاء الحساب' }, { status: 500 });
    }

    // generate OTP and send email for verification
    const otp = await createOtp(email);
    try {
      await sendOtpEmail(email, otp, 'register');
    } catch (e) {
      console.error('sendOtpEmail failed', e);
    }

    // respond as pending — do not sign in until email verified
    return NextResponse.json({ message: 'تم إنشاء الحساب — يرجى التحقق من بريدك الإلكتروني', pending: true, email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), emailRaw: email }, { status: 201 });
  } catch (error) {
    console.error('Register error', error);
    return NextResponse.json(
      { message: 'حدث خطأ أثناء التسجيل' },
      { status: 500 }
    );
  }
}
