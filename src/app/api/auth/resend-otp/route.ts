import { NextRequest, NextResponse } from 'next/server';
import { createOtp } from '../../../../lib/otp';
import { sendOtpEmail } from '../../../../lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const type = String(body.type || 'general');

    if (!email) {
      return NextResponse.json({ message: 'البريد الإلكتروني مطلوب' }, { status: 400 });
    }

    // Do not accept masked emails for sending
    if (email.includes('***')) {
      return NextResponse.json({ message: 'الرجاء إدخال البريد الإلكتروني الكامل لإعادة الإرسال' }, { status: 400 });
    }

    try {
      const otp = await createOtp(email, 30); // 30s cooldown
      const emailResult = await sendOtpEmail(email, otp, type === 'register' ? 'register' : 'reset');

      return NextResponse.json({
        message: emailResult.sent ? 'تم إعادة إرسال رمز التحقق' : 'تم إنشاء رمز جديد، لكن البريد الإلكتروني لم يرسل في بيئة Vercel. استخدم الرمز التالي: ' + otp,
        otp: emailResult.otp,
        fallback: !emailResult.sent,
      });
    } catch (err: any) {
      if (String(err.message).startsWith('Cooldown')) {
        return NextResponse.json({ message: err.message }, { status: 429 });
      }
      throw err;
    }
  } catch (error) {
    console.error('resend-otp error:', error);
    return NextResponse.json({ message: 'خطأ في النظام' }, { status: 500 });
  }
}
