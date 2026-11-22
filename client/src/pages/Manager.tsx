import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Boxes,
  QrCode,
  LogOut,
  RefreshCw,
  CheckCircle2,
  Clock,
  Eye,
  Check,
  Ban,
  Printer,
  Download,
  Copy,
  ExternalLink,
  Utensils,
  Compass,
  Sunset,
  Sparkles,
  Heart,
  Plane,
  User,
  BedDouble,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import catalogData from "../../../data/riads/riad-atlas-acacia/catalog.json";
import riadData from "../../../data/riad.json";

interface Order {
  id: string;
  timestamp: string;
  status: "new" | "seen" | "confirmed" | "done";
  room: string;
  guestName?: string;
  category: string;
  items: string;
  totalMAD: number;
  flightNumber?: string;
  notes?: string;
}

const ROOM_QR_LIST = [
  { id: "atlas", name: "Suite Atlas", floor: "1er Étage", file: "qr-suite-atlas", badge: "Suite 1", code: "atlas" },
  { id: "majorelle", name: "Suite Majorelle", floor: "1er Étage", file: "qr-suite-majorelle", badge: "Suite 2", code: "majorelle" },
  { id: "ourika", name: "Suite Ourika", floor: "1er Étage", file: "qr-suite-ourika", badge: "Suite 3", code: "ourika" },
  { id: "koutoubia", name: "Suite Koutoubia", floor: "1er Étage", file: "qr-suite-koutoubia", badge: "Suite 4", code: "koutoubia" },
  { id: "makhila", name: "Suite Makhila", floor: "Terrasse", file: "qr-suite-makhila", badge: "Suite 5", code: "makhila" },
  { id: "mimosa", name: "Suite Mimosa", floor: "Terrasse", file: "qr-suite-mimosa", badge: "Suite 6", code: "mimosa" },
  { id: "reception", name: "Accueil & Réception", floor: "Patio", file: "qr-reception", badge: "Lobby", code: "reception" },
  { id: "prearrival", name: "Guide Pré-Arrivée", floor: "Arrivée", file: "qr-prearrival", badge: "Arrivée", code: "prearrival" },
];

const getRoomQrUrl = (code: string) => {
  const base = typeof window !== "undefined" && window.location.origin ? window.location.origin : "https://riadatlasacacia.com";
  if (code === "reception") return `${base}/?src=qr-reception`;
  if (code === "prearrival") return `${base}/?src=prearrival`;
  return `${base}/?src=qr-room&room=${code}`;
};

export default function Manager() {
  const [, navigate] = useLocation();
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [activeTab, setActiveTab] = useState<"orders" | "stock" | "qr">("orders");

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderFilter, setOrderFilter] = useState<"all" | "new" | "seen" | "confirmed" | "done">("all");

  // Stock state: map of itemId -> boolean (false = unavailable)
  const [stock, setStock] = useState<Record<string, boolean>>({});
  const [stockCategory, setStockCategory] = useState<string>("all");
  const [stockSaving, setStockSaving] = useState<string | null>(null);

  // QR Placards state
  const [selectedQrId, setSelectedQrId] = useState<string>("atlas");
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Auth guard
  useEffect(() => {
    if (sessionStorage.getItem("manager_auth") !== "ok") {
      navigate("/manager");
    }
  }, [navigate]);

  // Load orders
  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    let loaded = false;
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setOrders(data);
          loaded = true;
        }
      }
    } catch {
      // Offline fallback
    }

    if (!loaded) {
      try {
        const local = JSON.parse(localStorage.getItem("riad_orders") || "[]");
        if (Array.isArray(local)) {
          setOrders(local);
        }
      } catch {
        // Ignored
      }
    }
    setLoadingOrders(false);
  }, []);

  // Load stock
  const fetchStock = useCallback(async () => {
    try {
      const res = await fetch("/api/stock");
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === "object") {
          setStock(data);
          return;
        }
      }
    } catch {
      // Offline fallback
    }
    try {
      const local = JSON.parse(localStorage.getItem("riad_stock") || "{}");
      if (local && typeof local === "object") {
        setStock(local);
      }
    } catch {
      // Ignored
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchStock();
    // Poll orders every 30s
    const timer = setInterval(fetchOrders, 30000);
    return () => clearInterval(timer);
  }, [fetchOrders, fetchStock]);

  const updateOrderStatus = async (orderId: string, nextStatus: Order["status"]) => {
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o));
      try {
        localStorage.setItem("riad_orders", JSON.stringify(updated));
      } catch {
        // Ignored
      }
      return updated;
    });

    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch {
      // Ignored
    }
  };

  const toggleStock = async (itemId: string, currentAvailable: boolean) => {
    const nextState = !currentAvailable;
    setStockSaving(itemId);
    setStock((prev) => {
      const updated = { ...prev, [itemId]: nextState };
      try {
        localStorage.setItem("riad_stock", JSON.stringify(updated));
      } catch {
        // Ignored
      }
      return updated;
    });

    try {
      await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [itemId]: nextState }),
      });
    } catch {
      // Ignored
    } finally {
      setStockSaving(null);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("manager_auth");
    navigate("/manager");
  };

  const isFr = lang === "fr";

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === "all") return true;
    return o.status === orderFilter;
  });

  const activeQr = ROOM_QR_LIST.find((q) => q.id === selectedQrId) || ROOM_QR_LIST[0];

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "new":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-xs font-bold text-amber-800">
            <Clock className="w-3 h-3" />
            {isFr ? "Nouveau" : "New"}
          </span>
        );
      case "seen":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 border border-blue-300 px-2.5 py-0.5 text-xs font-bold text-blue-800">
            <Eye className="w-3 h-3" />
            {isFr ? "Vu" : "Seen"}
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            {isFr ? "Confirmé" : "Confirmed"}
          </span>
        );
      case "done":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 border border-stone-300 px-2.5 py-0.5 text-xs font-bold text-stone-600">
            <Check className="w-3 h-3" />
            {isFr ? "Terminé" : "Done"}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917]">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-[#E0D5C7] bg-white/95 px-4 py-3 shadow-xs backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#B85C3C] text-white font-bold text-base shadow-xs">
              RA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-[#1C1917] sm:text-base">
                  {riadData.name}
                </h1>
                <span className="rounded-full bg-[#B85C3C]/10 px-2 py-0.5 text-[10px] font-bold text-[#B85C3C]">
                  Manager
                </span>
              </div>
              <p className="text-[11px] text-[#78716C]">
                {isFr ? "Tableau de bord & Suivi" : "Operations & Tracking Dashboard"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang((l) => (l === "fr" ? "en" : "fr"))}
              className="rounded-lg border border-[#E0D5C7] bg-white px-2.5 py-1 text-xs font-semibold text-[#78716C] hover:bg-[#F5F1E8] transition-colors"
            >
              {isFr ? "EN" : "FR"}
            </button>
            <button
              onClick={handleLogout}
              title={isFr ? "Déconnexion" : "Sign Out"}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E0D5C7] bg-white px-3 py-1.5 text-xs font-semibold text-[#78716C] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isFr ? "Quitter" : "Exit"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* Navigation Tabs */}
        <div className="mb-6 flex border-b border-[#E0D5C7]">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
              activeTab === "orders"
                ? "border-[#B85C3C] text-[#B85C3C]"
                : "border-transparent text-[#78716C] hover:text-[#1C1917]"
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            <span>{isFr ? "Commandes" : "Orders"}</span>
            {orders.filter((o) => o.status === "new").length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                {orders.filter((o) => o.status === "new").length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("stock")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
              activeTab === "stock"
                ? "border-[#B85C3C] text-[#B85C3C]"
                : "border-transparent text-[#78716C] hover:text-[#1C1917]"
            }`}
          >
            <Boxes className="h-4 w-4" />
            <span>{isFr ? "Disponibilités & Stock" : "Stock & Availability"}</span>
          </button>

          <button
            onClick={() => setActiveTab("qr")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
              activeTab === "qr"
                ? "border-[#B85C3C] text-[#B85C3C]"
                : "border-transparent text-[#78716C] hover:text-[#1C1917]"
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span>{isFr ? "Chevalets QR" : "QR Placards"}</span>
          </button>
        </div>

        {/* ── TAB 1: ORDERS TRACKING ────────────────────────────────────────── */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#1C1917]">
                  {isFr ? "Suivi des Demandes WhatsApp" : "WhatsApp Orders Tracking"}
                </h2>
                <p className="text-xs text-[#78716C]">
                  {isFr
                    ? "Toutes les demandes envoyées depuis le guide client sont enregistrées ici en temps réel."
                    : "Every request initiated through the guest guide is recorded here in real time."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchOrders}
                  disabled={loadingOrders}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#E0D5C7] bg-white px-3 py-1.5 text-xs font-semibold text-[#1C1917] hover:bg-[#F5F1E8] transition-colors"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingOrders ? "animate-spin" : ""}`} />
                  <span>{isFr ? "Actualiser" : "Refresh"}</span>
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
              {(["all", "new", "seen", "confirmed", "done"] as const).map((st) => {
                const count = st === "all" ? orders.length : orders.filter((o) => o.status === st).length;
                return (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`rounded-lg px-3 py-1.5 transition-colors ${
                      orderFilter === st
                        ? "bg-[#B85C3C] text-white"
                        : "bg-white border border-[#E0D5C7] text-[#78716C] hover:bg-[#F5F1E8]"
                    }`}
                  >
                    {st === "all" && (isFr ? "Toutes" : "All")}
                    {st === "new" && (isFr ? "Nouvelles" : "New")}
                    {st === "seen" && (isFr ? "Vues" : "Seen")}
                    {st === "confirmed" && (isFr ? "Confirmées" : "Confirmed")}
                    {st === "done" && (isFr ? "Terminées" : "Done")}
                    {" "}({count})
                  </button>
                );
              })}
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="rounded-2xl border border-[#E0D5C7] bg-white p-12 text-center">
                <ClipboardList className="mx-auto h-10 w-10 text-[#C4BAB0] mb-3" />
                <h3 className="text-sm font-bold text-[#1C1917]">
                  {isFr ? "Aucune commande dans cette vue" : "No orders in this view"}
                </h3>
                <p className="mt-1 text-xs text-[#78716C]">
                  {isFr
                    ? "Les futures commandes passées depuis les chambres apparaîtront ici."
                    : "Incoming orders sent by guests will show up here automatically."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-[#E0D5C7] bg-white p-4 shadow-xs hover:border-[#B85C3C]/40 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F5F1E8] pb-3 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(order.status)}
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#B85C3C]/10 px-2 py-0.5 text-xs font-bold text-[#B85C3C]">
                          <BedDouble className="w-3.5 h-3.5" />
                          {order.room}
                        </span>
                        {order.flightNumber && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 border border-sky-200 px-2 py-0.5 text-xs font-semibold text-sky-800">
                            <Plane className="w-3 h-3" />
                            {order.flightNumber}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-[#78716C]">
                        {new Date(order.timestamp).toLocaleString(isFr ? "fr-FR" : "en-US", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                      <div className="sm:col-span-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-[#78716C] mb-0.5">
                          {isFr ? "Article / Prestation" : "Item / Service"}
                        </div>
                        <div className="text-sm font-semibold text-[#1C1917]">{order.items}</div>
                        {order.guestName && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-[#78716C]">
                            <User className="w-3.5 h-3.5 text-[#B85C3C]" />
                            <span>{order.guestName}</span>
                          </div>
                        )}
                        {order.notes && (
                          <p className="mt-1 text-xs text-[#78716C] bg-[#FAF7F2] p-2 rounded-lg italic">
                            "{order.notes}"
                          </p>
                        )}
                      </div>

                      <div className="sm:text-right flex sm:flex-col justify-between sm:justify-start items-center sm:items-end">
                        <div className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                          {isFr ? "Montant" : "Total"}
                        </div>
                        <div className="text-base font-bold text-[#B85C3C]">
                          {order.totalMAD} MAD
                        </div>
                      </div>
                    </div>

                    {/* Status bump buttons */}
                    <div className="flex items-center justify-end gap-1.5 border-t border-[#F5F1E8] pt-3 text-xs">
                      <span className="text-[#78716C] mr-2">
                        {isFr ? "Changer le statut :" : "Update status:"}
                      </span>
                      {order.status !== "new" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "new")}
                          className="rounded-md border border-[#E0D5C7] px-2.5 py-1 text-stone-700 hover:bg-[#F5F1E8]"
                        >
                          {isFr ? "Nouveau" : "New"}
                        </button>
                      )}
                      {order.status !== "seen" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "seen")}
                          className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 font-semibold text-blue-700 hover:bg-blue-100"
                        >
                          {isFr ? "Marquer Vu" : "Mark Seen"}
                        </button>
                      )}
                      {order.status !== "confirmed" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "confirmed")}
                          className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          {isFr ? "Confirmer" : "Confirm"}
                        </button>
                      )}
                      {order.status !== "done" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "done")}
                          className="rounded-md border border-stone-200 bg-stone-100 px-2.5 py-1 font-semibold text-stone-700 hover:bg-stone-200"
                        >
                          {isFr ? "Terminer" : "Done"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: STOCK & AVAILABILITY ──────────────────────────────────── */}
        {activeTab === "stock" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-[#1C1917]">
                {isFr ? "Disponibilités des Plats & Prestations" : "Item Availability & Stock"}
              </h2>
              <p className="text-xs text-[#78716C]">
                {isFr
                  ? "Désactivez temporairement un plat ou une excursion si les ingrédients manquent ou si le créneau est complet. Les clients verront l'article comme 'Temporairement Indisponible'."
                  : "Temporarily disable any dish or service if ingredients are out or a tour is fully booked. Guests will see the item flagged as 'Temporarily Unavailable'."}
              </p>
            </div>

            {/* Category filter */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
              <button
                onClick={() => setStockCategory("all")}
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  stockCategory === "all"
                    ? "bg-[#B85C3C] text-white"
                    : "bg-white border border-[#E0D5C7] text-[#78716C] hover:bg-[#F5F1E8]"
                }`}
              >
                {isFr ? "Toutes les catégories" : "All Categories"}
              </button>
              {catalogData.categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setStockCategory(cat.id)}
                  className={`rounded-lg px-3 py-1.5 transition-colors ${
                    stockCategory === cat.id
                      ? "bg-[#B85C3C] text-white"
                      : "bg-white border border-[#E0D5C7] text-[#78716C] hover:bg-[#F5F1E8]"
                  }`}
                >
                  {isFr ? cat.title.fr : cat.title.en}
                </button>
              ))}
            </div>

            {/* Catalog Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {catalogData.items
                .filter((item) => stockCategory === "all" || item.category_id === stockCategory)
                .map((item) => {
                  const isAvailable = stock[item.id] !== false; // default true
                  const isSaving = stockSaving === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between gap-3 rounded-2xl border p-3 transition-colors ${
                        isAvailable
                          ? "border-[#E0D5C7] bg-white"
                          : "border-rose-200 bg-rose-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={item.image}
                          alt={item.title.en}
                          className={`h-14 w-14 rounded-xl object-cover shrink-0 ${
                            isAvailable ? "" : "grayscale opacity-60"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-[#1C1917] truncate">
                            {isFr ? item.title.fr : item.title.en}
                          </h4>
                          <p className="text-[11px] text-[#78716C] capitalize">
                            {item.category_id}
                          </p>
                          <div className="mt-1">
                            {isAvailable ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                                <CheckCircle2 className="w-3 h-3" />
                                {isFr ? "Disponible" : "Available"}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700">
                                <Ban className="w-3 h-3" />
                                {isFr ? "Indisponible" : "Unavailable"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Toggle button */}
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => toggleStock(item.id, isAvailable)}
                        className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                          isAvailable
                            ? "bg-rose-100 text-rose-800 hover:bg-rose-200"
                            : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                        } disabled:opacity-50`}
                      >
                        {isSaving
                          ? "..."
                          : isAvailable
                          ? isFr
                            ? "Désactiver"
                            : "Disable"
                          : isFr
                          ? "Réactiver"
                          : "Re-enable"}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ── TAB 3: QR PLACARDS ───────────────────────────────────────────── */}
        {activeTab === "qr" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#1C1917]">
                  {isFr ? "Chevalets QR de Chevet & Réception" : "In-Room & Reception QR Placards"}
                </h2>
                <p className="text-xs text-[#78716C]">
                  {isFr
                    ? "Générez et imprimez les chevalets pour chaque chambre. Chaque QR identifie la suite automatiquement."
                    : "Generate and print bedside placards for each room. Each QR automatically tags the guest's suite."}
                </p>
              </div>

              <a
                href="/qr-placards/print.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#B85C3C] bg-[#B85C3C] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#A04A2F] transition-colors self-start sm:self-auto shadow-xs"
              >
                <Printer className="h-4 w-4" />
                <span>{isFr ? "Imprimer tous les chevalets (A5)" : "Print All Placards (A5)"}</span>
              </a>
            </div>

            {/* Room Selector Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-2">
              {ROOM_QR_LIST.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedQrId(item.id)}
                  className={`whitespace-nowrap px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedQrId === item.id
                      ? "bg-[#B85C3C] text-white shadow-xs"
                      : "bg-white border border-[#E0D5C7] text-[#2C2C2C] hover:bg-[#F5F1E8]"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>

            {/* Selected Room Details Card */}
            <div className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl border border-[#E0D5C7] bg-white p-6 shadow-xs text-center sm:text-left">
              <div className="relative rounded-2xl border border-[#E0D5C7] bg-[#FDFBF7] p-3 shadow-xs shrink-0">
                <img
                  src={`/qr-placards/${activeQr.file}.png`}
                  alt={`${activeQr.name} QR Code`}
                  className="h-44 w-44 object-contain"
                />
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="text-xl font-bold text-[#1C1917]">{activeQr.name}</span>
                  <span className="rounded-full bg-[#B85C3C]/10 px-2.5 py-0.5 text-xs font-bold text-[#B85C3C]">
                    {activeQr.floor}
                  </span>
                  <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-bold text-stone-700">
                    {activeQr.badge}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1">
                    {isFr ? "Lien d'atterrissage direct :" : "Direct landing link:"}
                  </div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <code className="text-xs font-mono bg-[#FAF7F2] border border-[#E0D5C7] px-2.5 py-1 rounded-lg text-[#B85C3C] break-all">
                      {getRoomQrUrl(activeQr.id)}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(getRoomQrUrl(activeQr.id));
                        setCopiedUrl(true);
                        setTimeout(() => setCopiedUrl(false), 2000);
                      }}
                      className="rounded-lg border border-[#E0D5C7] bg-white p-1.5 text-[#78716C] hover:text-[#1C1917] transition-colors"
                      title={isFr ? "Copier le lien" : "Copy URL"}
                    >
                      {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <a
                      href={getRoomQrUrl(activeQr.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-[#E0D5C7] bg-white p-1.5 text-[#78716C] hover:text-[#1C1917] transition-colors"
                      title={isFr ? "Tester le lien" : "Test URL"}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-2.5 justify-center sm:justify-start">
                  <a
                    href={`/qr-placards/${activeQr.file}.png`}
                    download
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#B85C3C] px-4 py-2 text-xs font-bold text-white hover:bg-[#A04A2F] transition-colors shadow-xs"
                  >
                    <Download className="h-4 w-4" />
                    {isFr ? "Télécharger PNG HD" : "Download High-Res PNG"}
                  </a>
                  <a
                    href="/qr-placards/print.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#E0D5C7] bg-white px-4 py-2 text-xs font-semibold text-[#1C1917] hover:bg-[#F5F1E8] transition-colors"
                  >
                    <Printer className="h-4 w-4" />
                    {isFr ? "Imprimer le chevalet A5" : "Print A5 Placard"}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
