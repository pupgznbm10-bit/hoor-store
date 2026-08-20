import { NextRequest, NextResponse } from 'next/server';
import { readProducts, createProduct } from '../../../lib/products';
import { getCurrentUserFromRequest, isAdminUser } from '../../../lib/auth';
import { broadcastEvent } from '../../../lib/events';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    if (url.searchParams.get('sse')) {
      // Open SSE stream using existing in-memory broadcaster
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(': connected\n\n'));
          const push = (chunk: string) => {
            try { controller.enqueue(new TextEncoder().encode(chunk)); } catch (e) {}
          };
          // register and heartbeat
          const { registerClient, unregisterClient } = require('../../../lib/events');
          registerClient(push);
          const int = setInterval(() => { try { controller.enqueue(new TextEncoder().encode(': ping\n\n')); } catch(e){} }, 25_000);
          (controller as any).oncancel = () => { clearInterval(int); unregisterClient(push); };
        }
      });
      return new NextResponse(stream, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        }
      });
    }

    const products = await readProducts();
    return NextResponse.json({ products });
  } catch (err) {
    console.error('products GET error', err);
    return NextResponse.json({ message: 'خطأ في النظام' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user || !isAdminUser(user)) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
    }
    const body = await request.json();
    const created = await createProduct(body);
    try { await broadcastEvent({ type: 'products:updated', payload: { id: created.id, action: 'created' } }); } catch (e) {}
    return NextResponse.json({ message: 'تم إنشاء المنتج', product: created });
  } catch (err) {
    console.error('products POST error', err);
    return NextResponse.json({ message: 'خطأ في النظام' }, { status: 500 });
  }
}
