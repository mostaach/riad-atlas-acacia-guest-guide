/**
 * orderLogger — fire-and-forget helper.
 * Posts a submitted order to /api/orders after the WhatsApp link is opened.
 * Never blocks the guest experience; errors are silently swallowed.
 */

export interface OrderLog {
  room: string;
  guestName?: string;
  category: string;
  items: string;
  totalMAD: number;
  flightNumber?: string;
  notes?: string;
}

export async function logOrder(order: OrderLog): Promise<void> {
  try {
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
  } catch {
    // Intentionally silent — guest WhatsApp flow is unaffected
  }
}
