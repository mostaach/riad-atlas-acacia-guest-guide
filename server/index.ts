import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Data file paths ────────────────────────────────────────────────────────
const DATA_DIR = path.resolve(__dirname, "..", "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const STOCK_FILE = path.join(DATA_DIR, "stock.json");
const RIAD_FILE = path.join(DATA_DIR, "riad.json");

function readJson<T>(filePath: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function writeJson(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ── Nano-ID (no dep) ──────────────────────────────────────────────────────
function nanoId(len = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: len }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  // ── /api/config — exposes manager PIN (server-side only, not in client bundle)
  app.get("/api/config", (_req, res) => {
    const riad = readJson<{ manager_pin?: string }>(RIAD_FILE, {});
    res.json({ manager_pin: riad.manager_pin ?? "1234" });
  });

  // ── /api/orders ───────────────────────────────────────────────────────────
  app.get("/api/orders", (_req, res) => {
    const orders = readJson<unknown[]>(ORDERS_FILE, []);
    res.json(orders);
  });

  app.post("/api/orders", (req, res) => {
    const orders = readJson<Record<string, unknown>[]>(ORDERS_FILE, []);
    const order = {
      id: nanoId(),
      timestamp: new Date().toISOString(),
      status: "new",
      ...req.body,
    };
    orders.unshift(order); // newest first
    writeJson(ORDERS_FILE, orders);
    res.status(201).json(order);
  });

  app.patch("/api/orders/:id", (req, res) => {
    const orders = readJson<Record<string, unknown>[]>(ORDERS_FILE, []);
    const idx = orders.findIndex((o) => o.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    orders[idx] = { ...orders[idx], ...req.body };
    writeJson(ORDERS_FILE, orders);
    res.json(orders[idx]);
  });

  // ── /api/stock ────────────────────────────────────────────────────────────
  app.get("/api/stock", (_req, res) => {
    res.json(readJson<Record<string, boolean>>(STOCK_FILE, {}));
  });

  app.post("/api/stock", (req, res) => {
    const current = readJson<Record<string, boolean>>(STOCK_FILE, {});
    const updated = { ...current, ...req.body };
    writeJson(STOCK_FILE, updated);
    res.json(updated);
  });

  // ── Static files ──────────────────────────────────────────────────────────
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
