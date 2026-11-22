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
  // Always persist locally in browser storage so order is recorded even on static hosts (Vercel)
  try {
    const existing = JSON.parse(localStorage.getItem("riad_orders") || "[]");
    const newOrder = {
      id: Math.random().toString(36).substring(2, 8),
      timestamp: new Date().toISOString(),
      status: "new",
      ...order,
    };
    existing.unshift(newOrder);
    localStorage.setItem("riad_orders", JSON.stringify(existing.slice(0, 100)));
  } catch {
    // Local storage full or unavailable
  }

  // Also POST to /api/orders (when running with backend)
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
