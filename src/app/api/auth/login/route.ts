import { NextResponse } from 'next/server';
import {
  authCookieOptions,
  signSessionToken,
  verifyCredentials,
} from '../../../../lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email ?? '').trim();
    const password = String(body?.password ?? '');

    if (!email || !password) {
      return NextResponse.json(
        { message: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    const user = await verifyCredentials(email, password);
    if (!user) {
      return NextResponse.json(
        { message: 'بيانات اعتماد غير صحيحة' },
        { status: 401 }
      );
    }

    const token = signSessionToken(user);
    const response = NextResponse.json({
      user,
      message: 'تم تسجيل الدخول بنجاح',
    });

    response.cookies.set({
      ...authCookieOptions(),
      value: token,
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Login error', error);
    return NextResponse.json(
      { message: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}
