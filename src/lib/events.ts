// Simple in-memory SSE broadcaster for dev/local use

type EventPayload = { type: string; payload?: any };

declare global {
  // eslint-disable-next-line no-var
  var __hoor_event_clients: Array<(e: string) => void> | undefined;
}

if (!global.__hoor_event_clients) {
  global.__hoor_event_clients = [];
}

export function registerClient(push: (chunk: string) => void) {
  global.__hoor_event_clients!.push(push);
}

export function unregisterClient(push: (chunk: string) => void) {
  global.__hoor_event_clients = (global.__hoor_event_clients || []).filter((p) => p !== push);
}

export async function broadcastEvent(ev: EventPayload) {
  const msg = `event: message\ndata: ${JSON.stringify(ev)}\n\n`;
  const clients = global.__hoor_event_clients || [];
  for (const p of clients) {
    try {
      p(msg);
    } catch (e) {
      // ignore
    }
  }
}
