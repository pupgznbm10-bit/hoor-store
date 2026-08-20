import fs from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromRequest, isAdminUser } from '../../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user || !isAdminUser(user)) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
    }

    const formData = await request.formData();
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const urls: string[] = [];
    for (const entry of formData.entries()) {
      const [key, value] = entry as [string, any];
      if (value && typeof value === 'object' && typeof value.arrayBuffer === 'function') {
        const filename = (value.name || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
        const unique = `${Date.now()}-${Math.random().toString(36).slice(2,8)}-${filename}`;
        const filePath = path.join(uploadsDir, unique);
        const buffer = Buffer.from(await value.arrayBuffer());
        await fs.writeFile(filePath, buffer);
        // Return URL path relative to public
        const urlPath = `/uploads/${unique}`;
        urls.push(urlPath);
      }
    }

    return NextResponse.json({ urls });
  } catch (err) {
    console.error('upload error', err);
    return NextResponse.json({ message: 'خطأ في رفع الملف' }, { status: 500 });
  }
}
