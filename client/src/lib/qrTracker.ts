import { track } from "@vercel/analytics";

export interface QrScanRecord {
  id: string;
  timestamp: string;
  src: string;
  room?: string;
  riadId?: string;
  userAgent?: string;
  language?: string;
}

export interface QrStats {
  totalScans: number;
  byRoom: Record<string, number>;
  bySource: Record<string, number>;
  recentScans: QrScanRecord[];
}

const STORAGE_KEY = "riad_qr_scans";

/**
 * Tracks a QR code landing scan:
 * 1. Persists locally in localStorage for manager dashboard inspection.
 * 2. Emits privacy-friendly event to @vercel/analytics.
 * 3. Silently posts to /api/qr-scans if backend is active.
 */
export async function trackQrScan(params: {
  src: string;
  room?: string;
  riadId?: string;
  language?: string;
}): Promise<void> {
  const record: QrScanRecord = {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    src: params.src || "unknown",
    room: params.room || undefined,
    riadId: params.riadId || "riad-atlas-acacia",
    userAgent: typeof navigator !== "undefined" ? (navigator.userAgent.includes("Mobile") ? "Mobile" : "Desktop") : undefined,
    language: params.language || (typeof navigator !== "undefined" ? navigator.language : "en"),
  };

  // 1. Local Storage persistence
  try {
    const existing: QrScanRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    // Prevent duplicate track within 10 seconds of exact same room & source
    const recentDuplicate = existing.find(
      (s) =>
        s.src === record.src &&
        s.room === record.room &&
        Date.now() - new Date(s.timestamp).getTime() < 10000
    );
    if (!recentDuplicate) {
      existing.unshift(record);
      // Keep last 150 scans
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 150)));
    }
  } catch (err) {
    console.warn("Could not save QR scan locally:", err);
  }

  // 2. Vercel Analytics event
  try {
    track("qr_scan", {
      src: record.src,
      room: record.room || "none",
      riadId: record.riadId,
      device: record.userAgent,
    });
  } catch {
    // Analytics unavailable/blocked
  }

  // 3. Silent API beacon (fire-and-forget)
  try {
    if (typeof fetch !== "undefined") {
      fetch("/api/qr-scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      }).catch(() => {
        // Silent
      });
    }
  } catch {
    // Silent
  }
}

/**
 * Retrieves aggregated QR scan statistics for the manager dashboard
 */
export function getQrStats(): QrStats {
  try {
    const scans: QrScanRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const byRoom: Record<string, number> = {};
    const bySource: Record<string, number> = {};

    for (const scan of scans) {
      const roomKey = scan.room || "Unassigned / General";
      byRoom[roomKey] = (byRoom[roomKey] || 0) + 1;

      const srcKey = scan.src || "direct";
      bySource[srcKey] = (bySource[srcKey] || 0) + 1;
    }

    return {
      totalScans: scans.length,
      byRoom,
      bySource,
      recentScans: scans.slice(0, 20),
    };
  } catch {
    return {
      totalScans: 0,
      byRoom: {},
      bySource: {},
      recentScans: [],
    };
  }
}
