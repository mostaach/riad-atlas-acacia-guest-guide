import React, { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Sparkles,
  Info,
  Car,
  Utensils,
  ChevronRight,
  Leaf,
  CreditCard,
  Banknote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CatalogItem,
  CatalogOption,
  calculatePrice,
  PriceResult,
} from '@/lib/pricing';
import { buildWhatsAppMessage, createWhatsAppLink } from '@/lib/whatsapp';
import { validateDiningOrder } from '@/lib/diningRules';
import { WhatsAppIcon } from '@/components/WhatsAppIcon';

interface BookingModalProps {
  item: CatalogItem | null;
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'fr';
  primaryCurrency: 'MAD' | 'EUR';
  whatsappNumber: string;
}

export default function BookingModal({
  item,
  isOpen,
  onClose,
  language,
  primaryCurrency,
  whatsappNumber,
}: BookingModalProps) {
  if (!item || !isOpen) return null;

  const isFr = language === 'fr';

  // Form states
  const [guests, setGuests] = useState<number>(2);
  const [selectedOptionId, setSelectedOptionId] = useState<string>(() => {
    return item.options?.[0]?.id || '';
  });
  const [useSharedMinibus, setUseSharedMinibus] = useState<boolean>(false);
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [time, setTime] = useState<string>('19:30');
  const [guestName, setGuestName] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Meal formula selections (per guest)
  const [mealSelections, setMealSelections] = useState<
    { starter: string; main: string; dessert: string }[]
  >(() => {
    return Array.from({ length: 2 }, () => ({
      starter: item.meal_selection?.starters?.[0]?.id || '',
      main: item.meal_selection?.mains?.[0]?.id || '',
      dessert: item.meal_selection?.desserts?.[0]?.id || '',
    }));
  });

  // Adjust meal selections if guest count changes
  const handleGuestChange = (newCount: number) => {
    const valid = Math.max(1, Math.min(20, newCount));
    setGuests(valid);
    if (item.meal_selection) {
      setMealSelections(prev => {
        if (valid > prev.length) {
          const added = Array.from({ length: valid - prev.length }, () => ({
            starter: item.meal_selection?.starters?.[0]?.id || '',
            main: item.meal_selection?.mains?.[0]?.id || '',
            dessert: item.meal_selection?.desserts?.[0]?.id || '',
          }));
          return [...prev, ...added];
        } else {
          return prev.slice(0, valid);
        }
      });
    }
  };

  // Pure price calculation
  let priceResult: PriceResult = { mad: 0, eur: 0 };
  try {
    priceResult = calculatePrice({
      item,
      guests,
      optionId: selectedOptionId,
      sharedMinibus: useSharedMinibus,
    });
  } catch (e) {
    console.error('Pricing calculation error:', e);
  }

  // Selected option details
  const selectedOption = item.options?.find(o => o.id === selectedOptionId);

  // Handle WhatsApp submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!guestName.trim()) {
      setFormError(
        isFr
          ? 'Veuillez saisir votre nom pour la réservation.'
          : 'Please enter your name for the booking request.'
      );
      return;
    }
    if (!roomNumber.trim()) {
      setFormError(
        isFr
          ? 'Veuillez indiquer votre numéro de chambre ou suite.'
          : 'Please enter your room or suite number.'
      );
      return;
    }

    // Dining rules enforcement
    if (item.category_id === 'dining') {
      const val = validateDiningOrder(date, time);
      if (!val.valid) {
        setFormError(isFr ? val.messageFr! : val.messageEn!);
        return;
      }
    }

    // Prepare human-readable meal selections
    let readableMeals = undefined;
    if (item.meal_selection && mealSelections.length > 0) {
      readableMeals = mealSelections.map(sel => {
        const s = item.meal_selection.starters.find((x: any) => x.id === sel.starter);
        const m = item.meal_selection.mains.find((x: any) => x.id === sel.main);
        const d = item.meal_selection.desserts.find((x: any) => x.id === sel.dessert);
        return {
          starter: s ? (isFr ? s.title.fr : s.title.en) : sel.starter,
          main: m ? (isFr ? m.title.fr : m.title.en) : sel.main,
          dessert: d ? (isFr ? d.title.fr : d.title.en) : sel.dessert,
        };
      });
    }

    const message = buildWhatsAppMessage({
      itemTitle: item.title,
      optionTitle: selectedOption?.title,
      date,
      time: item.category_id === 'dining' ? time : undefined,
      guests,
      price: priceResult,
      guestName,
      roomNumber,
      notes,
      mealSelections: readableMeals,
      language,
    });

    const link = createWhatsAppLink(whatsappNumber, message);
    window.open(link, '_blank');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.25 }}
          className="bg-background text-foreground w-full max-w-lg max-h-[92vh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border"
        >
          {/* Header */}
          <div className="relative h-44 sm:h-52 w-full shrink-0 overflow-hidden bg-muted">
            <img
              src={item.image}
              alt={isFr ? item.title.fr : item.title.en}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-xs font-semibold tracking-wider uppercase text-amber-300">
                {item.category_id.toUpperCase()}
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold leading-tight">
                {isFr ? item.title.fr : item.title.en}
              </h2>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Short Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isFr
                ? item.description?.fr || item.short_description?.fr
                : item.description?.en || item.short_description?.en}
            </p>

            {/* Discount Alert */}
            {item.cash_discount_applies && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs sm:text-sm font-medium">
                <Banknote className="w-5 h-5 shrink-0 text-amber-600" />
                <span>
                  {isFr
                    ? '−10% de remise supplémentaire pour tout règlement en espèces (€ ou MAD) !'
                    : '−10% cash discount granted if you pay in cash (€ or MAD)!'}
                </span>
              </div>
            )}

            {/* Option selector if options exist */}
            {item.options && item.options.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {isFr ? 'Choisir une option' : 'Select Option'}
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {item.options.map(opt => {
                    const isSelected = selectedOptionId === opt.id;
                    const optPrice = opt.price || opt.base_price;
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setSelectedOptionId(opt.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left text-sm transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 font-medium text-foreground ring-1 ring-primary'
                            : 'border-border bg-card hover:bg-muted/50 text-foreground'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{isFr ? opt.title.fr : opt.title.en}</div>
                          {opt.unit && (
                            <span className="text-xs text-muted-foreground">
                              {opt.unit === 'per_group'
                                ? isFr
                                  ? 'Tarif groupe / véhicule'
                                  : 'Per vehicle / group'
                                : opt.unit === 'per_2_people'
                                ? isFr
                                  ? 'Tarif pour 2 personnes'
                                  : 'Price for 2 persons'
                                : isFr
                                ? 'Par personne'
                                : 'Per person'}
                            </span>
                          )}
                        </div>
                        {optPrice && (
                          <div className="text-right shrink-0 ml-3">
                            <span className="font-bold text-primary">
                              {primaryCurrency === 'MAD'
                                ? `${optPrice.mad} MAD`
                                : `${optPrice.eur} €`}
                            </span>
                            <span className="block text-[11px] text-muted-foreground">
                              {primaryCurrency === 'MAD'
                                ? `${optPrice.eur} €`
                                : `${optPrice.mad} MAD`}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Shared Minibus Toggle (for Day Trips) */}
            {item.shared_minibus && (
              <div className="p-3 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">
                      {isFr ? 'Transport partagé en minibus' : 'Shared minibus option'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={useSharedMinibus}
                    onChange={e => setUseSharedMinibus(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {isFr
                    ? `Minibus partagé : ${item.shared_minibus.mad} MAD / ${item.shared_minibus.eur} € par personne.`
                    : `Shared minibus: ${item.shared_minibus.mad} MAD / ${item.shared_minibus.eur} € per person.`}
                </p>
              </div>
            )}

            {/* Guest counter */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold">
                  {isFr ? 'Nombre de personnes' : 'Number of Guests'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleGuestChange(guests - 1)}
                  disabled={guests <= 1}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center font-bold text-base disabled:opacity-30 hover:bg-muted"
                >
                  -
                </button>
                <span className="font-bold text-base w-4 text-center">{guests}</span>
                <button
                  type="button"
                  onClick={() => handleGuestChange(guests + 1)}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center font-bold text-base hover:bg-muted"
                >
                  +
                </button>
              </div>
            </div>

            {/* Meal choices (if dining) */}
            {item.meal_selection && (
              <div className="space-y-4 pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {isFr ? 'Choix des plats par voyageur' : 'Menu Choices per Guest'}
                  </span>
                </div>

                {Array.from({ length: guests }).map((_, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-border bg-card space-y-3">
                    <div className="text-xs font-bold text-primary">
                      {isFr ? `Voyageur ${idx + 1}` : `Guest ${idx + 1}`}
                    </div>

                    {/* Starter */}
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        {isFr ? '1. Entrée au choix' : '1. Starter'}
                      </label>
                      <select
                        value={mealSelections[idx]?.starter || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setMealSelections(prev => {
                            const updated = [...prev];
                            updated[idx] = { ...updated[idx], starter: val };
                            return updated;
                          });
                        }}
                        className="w-full text-xs p-2 rounded-lg border border-border bg-background"
                      >
                        {item.meal_selection.starters.map((s: any) => (
                          <option key={s.id} value={s.id}>
                            {isFr ? s.title.fr : s.title.en} {s.vegetarian ? '🌱' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Main */}
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        {isFr ? '2. Plat principal au choix' : '2. Main Course'}
                      </label>
                      <select
                        value={mealSelections[idx]?.main || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setMealSelections(prev => {
                            const updated = [...prev];
                            updated[idx] = { ...updated[idx], main: val };
                            return updated;
                          });
                        }}
                        className="w-full text-xs p-2 rounded-lg border border-border bg-background"
                      >
                        {item.meal_selection.mains.map((m: any) => (
                          <option key={m.id} value={m.id}>
                            {isFr ? m.title.fr : m.title.en} {m.vegetarian ? '🌱' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Dessert */}
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        {isFr ? '3. Dessert & Eau minérale' : '3. Dessert & Water'}
                      </label>
                      <input
                        type="text"
                        disabled
                        value={
                          isFr
                            ? 'Dessert du jour & Eau minérale'
                            : 'Dessert of the day & Mineral water'
                        }
                        className="w-full text-xs p-2 rounded-lg border border-border bg-muted text-muted-foreground"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Date and Time inputs */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  {isFr ? 'Date' : 'Date'}
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-border bg-card text-foreground"
                  />
                </div>
              </div>

              {item.category_id === 'dining' ? (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    {isFr ? 'Heure du repas' : 'Meal Time'}
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-border bg-card text-foreground"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    {isFr ? 'Horaire' : 'Preferred Time'}
                  </label>
                  <input
                    type="text"
                    placeholder={isFr ? 'Ex: Matin / 09h00' : 'e.g. Morning / 9:00 AM'}
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-border bg-card text-foreground"
                  />
                </div>
              )}
            </div>

            {/* Guest Name & Room */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  {isFr ? 'Votre nom' : 'Your Name'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Connor"
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-card text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  {isFr ? 'Chambre / Suite' : 'Room / Suite'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suite Acacia"
                  value={roomNumber}
                  onChange={e => setRoomNumber(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-card text-foreground"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                {isFr ? 'Précisions ou allergies' : 'Notes / Dietary Requirements'}
              </label>
              <textarea
                rows={2}
                placeholder={
                  isFr
                    ? 'Allergies, anniversaire, préférences...'
                    : 'Allergies, special occasions, pickups...'
                }
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-border bg-card text-foreground resize-none"
              />
            </div>

            {/* Form Error */}
            {formError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Payment Method Note */}
            {item.payment && item.payment.method !== 'unspecified' && (
              <div className="text-[12px] text-muted-foreground flex items-center gap-1.5 px-1">
                <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>
                  {item.payment.method === 'cash_mad_to_driver'
                    ? isFr
                      ? 'Règlement : uniquement en espèces MAD auprès du chauffeur.'
                      : 'Payment: in MAD cash directly to the driver.'
                    : isFr
                    ? 'Règlement : sur place au Riad.'
                    : 'Payment: at the Riad.'}
                </span>
              </div>
            )}
          </div>

          {/* Sticky Total & CTA Footer */}
          <div className="p-4 sm:p-5 border-t border-border bg-background/95 backdrop-blur-xs flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] text-muted-foreground uppercase font-semibold">
                {isFr ? 'Total Estimé' : 'Estimated Total'}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-serif font-bold text-primary">
                  {primaryCurrency === 'MAD'
                    ? `${priceResult.mad} MAD`
                    : `${priceResult.eur} €`}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({primaryCurrency === 'MAD' ? `${priceResult.eur} €` : `${priceResult.mad} MAD`})
                </span>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg flex items-center gap-2 font-semibold px-5"
            >
              <WhatsAppIcon className="w-5 h-5 rounded-full" />
              <span>{isFr ? 'Envoyer via WhatsApp' : 'Request via WhatsApp'}</span>
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
