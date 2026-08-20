import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'تم تسجيل الخروج بنجاح' });

  response.cookies.set({
    name: 'hoor_token',
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
