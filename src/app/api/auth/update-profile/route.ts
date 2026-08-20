import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromRequest, updateUserProfile } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) return NextResponse.json({ message: 'غير مسموح' }, { status: 401 });

    const body = await request.json();
    const allowed = {
      fullName: body.fullName,
      phone: body.phone,
      city: body.city,
      address: body.address,
    };

    const updated = await updateUserProfile(user.id, allowed);
    if (!updated) return NextResponse.json({ message: 'فشل تحديث الملف' }, { status: 500 });

    return NextResponse.json({ message: 'تم تحديث الملف الشخصي', user: updated });
  } catch (error) {
    console.error('update-profile error', error);
    return NextResponse.json({ message: 'خطأ في النظام' }, { status: 500 });
  }
}
