import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  AlertTriangle,
  Wifi,
  ThermometerSnowflake,
  Droplets,
  Sparkles,
  KeyRound,
  HelpCircle,
  Phone,
  Send,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { logOrder } from "@/lib/orderLogger";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: string;
  whatsappNumber: string;
  language: "en" | "fr";
}

const ISSUE_CATEGORIES = [
  {
    id: "ac",
    icon: ThermometerSnowflake,
    labelEn: "Air Conditioning / Heating",
    labelFr: "Climatisation / Chauffage",
  },
  {
    id: "wifi",
    icon: Wifi,
    labelEn: "Wi-Fi & Internet",
    labelFr: "Connexion Wi-Fi",
  },
  {
    id: "plumbing",
    icon: Droplets,
    labelEn: "Hot Water & Plumbing",
    labelFr: "Eau chaude & Plomberie",
  },
  {
    id: "housekeeping",
    icon: Sparkles,
    labelEn: "Housekeeping / Fresh Towels",
    labelFr: "Ménage & Serviettes",
  },
  {
    id: "key_safe",
    icon: KeyRound,
    labelEn: "Room Key & Safe Box",
    labelFr: "Clé de chambre & Coffre-fort",
  },
  {
    id: "other",
    icon: HelpCircle,
    labelEn: "Other Urgent Assistance",
    labelFr: "Autre demande urgente",
  },
];

export default function ReportModal({
  isOpen,
  onClose,
  room,
  whatsappNumber,
  language,
}: ReportModalProps) {
  const isFr = language === "fr";
  const [selectedCategory, setSelectedCategory] = useState<string>("ac");
  const [roomNumber, setRoomNumber] = useState<string>(room || "Suite Atlas");
  const [guestName, setGuestName] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (room) {
      setRoomNumber(room);
    }
  }, [room]);

  if (!isOpen) return null;

  const activeCategory = ISSUE_CATEGORIES.find((c) => c.id === selectedCategory) || ISSUE_CATEGORIES[0];
  const categoryLabel = isFr ? activeCategory.labelFr : activeCategory.labelEn;

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();

    const urgencyPrefix = isUrgent ? "🚨 [URGENT] " : "⚠️ ";
    const messageEn = `${urgencyPrefix}Room Issue / Assistance Request — Riad Atlas Acacia:
• Location / Suite: ${roomNumber || "Not specified"}
${guestName ? `• Guest Name: ${guestName}\n` : ""}• Category: ${categoryLabel}
• Details: ${details.trim() || "Assistance needed in room"}
• Sent via Guest Guide App`;

    const messageFr = `${urgencyPrefix}Signalement d'un problème — Riad Atlas Acacia:
• Chambre / Suite : ${roomNumber || "Non spécifiée"}
${guestName ? `• Nom du client : ${guestName}\n` : ""}• Type de problème : ${categoryLabel}
• Précisions : ${details.trim() || "Besoin d'intervention en chambre"}
• Envoyé depuis le Guide Résident`;

    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, "");
    const finalMsg = isFr ? messageFr : messageEn;
    const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(finalMsg)}`;

    // Log the report in manager system
    logOrder({
      room: roomNumber || "General",
      guestName: guestName || undefined,
      category: "incident_report",
      items: `[REPORT] ${categoryLabel}`,
      totalMAD: 0,
      notes: `${isUrgent ? "(URGENT) " : ""}${details.trim()}`,
    });

    setSubmitted(true);
    window.open(waUrl, "_blank");

    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.2 }}
          className="bg-white text-stone-900 w-full max-w-lg max-h-[92vh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-amber-200/50"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-5 shrink-0 border-b border-amber-500/20">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                {isFr ? "Assistance & Signalement" : "Guest Assistance & Report"}
              </span>
            </div>

            <h2 className="text-xl font-serif font-bold text-white">
              {isFr ? "Signaler un problème en chambre" : "Report a Room or Stay Issue"}
            </h2>
            <p className="text-xs text-stone-300 mt-1">
              {isFr
                ? "Notre équipe intervient rapidement pour garantir un séjour parfait."
                : "Our reception team is notified instantly to resolve any inconvenience."}
            </p>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSendReport} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Category selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-2">
                {isFr ? "1. Nature du problème" : "1. What is the issue about?"} *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ISSUE_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                        isSelected
                          ? "border-amber-500 bg-amber-50 text-stone-950 font-semibold ring-1 ring-amber-500"
                          : "border-stone-200 bg-white hover:bg-stone-50 text-stone-700"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-amber-600" : "text-stone-400"}`} />
                      <span className="truncate">{isFr ? cat.labelFr : cat.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Room Selector */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                  {isFr ? "Chambre / Suite" : "Room / Suite"} *
                </label>
                <select
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <optgroup label={isFr ? "Suites du 1er étage" : "1st Floor Suites"}>
                    <option value="Suite Atlas">Suite Atlas</option>
                    <option value="Suite Majorelle">Suite Majorelle</option>
                    <option value="Suite Ourika">Suite Ourika</option>
                    <option value="Suite Koutoubia">Suite Koutoubia</option>
                  </optgroup>
                  <optgroup label={isFr ? "Suites sur la Terrasse" : "Rooftop Suites"}>
                    <option value="Suite Makhila">Suite Makhila</option>
                    <option value="Suite Mimosa">Suite Mimosa</option>
                  </optgroup>
                  <optgroup label={isFr ? "Espaces communs" : "Common Areas"}>
                    <option value="Patio & Pool">{isFr ? "Patio central & Bassin" : "Patio & Plunge Pool"}</option>
                    <option value="Panoramic Rooftop">{isFr ? "Terrasse panoramique" : "Rooftop Terrace"}</option>
                    <option value="Moroccan Salon">{isFr ? "Salon marocain" : "Moroccan Salon"}</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                  {isFr ? "Votre Nom (Optionnel)" : "Your Name (Optional)"}
                </label>
                <input
                  type="text"
                  placeholder={isFr ? "Ex: Sarah" : "e.g. Sarah"}
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white text-stone-900"
                />
              </div>
            </div>

            {/* Details */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                {isFr ? "Précisions ou description" : "Details or Description"}
              </label>
              <textarea
                rows={3}
                placeholder={
                  isFr
                    ? "Ex: La climatisation ne souffle plus d'air frais, ou besoin de nouvelles serviettes de bain..."
                    : "e.g. Air conditioning is not blowing cool air, or need extra bath towels..."
                }
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 resize-none focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Urgent checkbox */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl border border-rose-200 bg-rose-50/50 text-rose-900">
              <input
                type="checkbox"
                id="urgent-check"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded border-rose-300 focus:ring-rose-500"
              />
              <label htmlFor="urgent-check" className="text-xs font-semibold cursor-pointer">
                {isFr ? "Demande urgente (intervention immédiate requise)" : "Urgent (immediate staff intervention required)"}
              </label>
            </div>

            {/* Direct Call Option */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-stone-100 border border-stone-200 text-xs">
              <div className="flex items-center gap-2 text-stone-700">
                <Phone className="w-3.5 h-3.5 text-stone-500" />
                <span>{isFr ? "Urgence immédiate 24/7 :" : "Immediate 24/7 hotline:"}</span>
              </div>
              <a
                href="tel:+212663715754"
                className="font-bold text-amber-800 hover:text-amber-900 underline"
              >
                +212 663-715754
              </a>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitted}
                className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                {submitted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isFr ? "Signalement transmis !" : "Report Transmitted!"}</span>
                  </>
                ) : (
                  <>
                    <WhatsAppIcon className="w-4 h-4 fill-white" />
                    <span>
                      {isFr
                        ? "Envoyer le signalement à la Réception (WhatsApp)"
                        : "Send Report to Reception (WhatsApp)"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
