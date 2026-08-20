import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
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

    return new Response(JSON.stringify({ urls }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('upload error', err);
    return new Response(JSON.stringify({ message: 'خطأ في رفع الملف' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
