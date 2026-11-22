import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, Eye, EyeOff } from "lucide-react";

const t = {
  en: {
    title: "Manager Portal",
    subtitle: "Riad Atlas Acacia",
    placeholder: "4-digit PIN",
    cta: "Sign In",
    error: "Incorrect PIN. Please try again.",
    hint: "Contact reception for access.",
  },
  fr: {
    title: "Portail Équipe",
    subtitle: "Riad Atlas Acacia",
    placeholder: "Code PIN (4 chiffres)",
    cta: "Connexion",
    error: "PIN incorrect. Veuillez réessayer.",
    hint: "Contactez la réception pour accéder.",
  },
} as const;

type Lang = "en" | "fr";

export default function ManagerLogin() {
  const [, navigate] = useLocation();
  const [lang, setLang] = useState<Lang>("en");
  const [pin, setPin] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [configPin, setConfigPin] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const copy = t[lang];

  // Already authed?
  useEffect(() => {
    if (sessionStorage.getItem("manager_auth") === "ok") {
      navigate("/manager/dashboard");
    }
  }, [navigate]);

  // Fetch PIN from server (not bundled in client)
  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => setConfigPin(d.manager_pin ?? "1234"))
      .catch(() => setConfigPin("1234"));
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pin === configPin) {
      sessionStorage.setItem("manager_auth", "ok");
      navigate("/manager/dashboard");
    } else {
      setError(true);
      setShake(true);
      setPin("");
      setTimeout(() => setShake(false), 600);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-4">
      {/* Language toggle */}
      <button
        onClick={() => setLang((l) => (l === "en" ? "fr" : "en"))}
        className="absolute top-4 right-4 rounded-full bg-white border border-[#E0D5C7] px-3 py-1 text-xs font-semibold text-[#78716C] hover:bg-[#F5F1E8] transition-colors"
      >
        {lang === "en" ? "FR" : "EN"}
      </button>

      <motion.div
        animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo / header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#B85C3C]/10 mb-4">
            <KeyRound className="w-7 h-7 text-[#B85C3C]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1C1917]">{copy.title}</h1>
          <p className="text-sm text-[#78716C] mt-1">{copy.subtitle}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-[#E0D5C7] shadow-sm p-6 space-y-4"
        >
          <div className="relative">
            <input
              ref={inputRef}
              type={show ? "text" : "password"}
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, "").slice(0, 4));
                setError(false);
              }}
              placeholder={copy.placeholder}
              autoFocus
              className="w-full rounded-xl border border-[#E0D5C7] bg-[#FDFBF7] px-4 py-3 pr-11 text-center text-2xl tracking-[0.5em] font-mono text-[#1C1917] placeholder:text-[#C4BAB0] placeholder:text-sm placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-[#B85C3C]/40"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917]"
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-red-600 text-center"
              >
                {copy.error}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={pin.length !== 4}
            className="w-full rounded-xl bg-[#B85C3C] py-3 text-sm font-semibold text-white hover:bg-[#A04A2F] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {copy.cta}
          </button>
        </form>

        <p className="text-center text-xs text-[#78716C] mt-4">{copy.hint}</p>
      </motion.div>
    </div>
  );
}
