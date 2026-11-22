import { PriceResult } from './pricing';

export interface BookingRequestData {
  itemTitle: { en: string; fr: string };
  optionTitle?: { en: string; fr: string };
  date: string;
  time?: string;
  guests: number;
  price: PriceResult;
  guestName: string;
  roomNumber: string;
  flightNumber?: string;
  notes?: string;
  mealSelections?: {
    starter?: string;
    main?: string;
    dessert?: string;
  }[];
  language: 'en' | 'fr';
}

/**
 * Builds the WhatsApp request message and wa.me URL according to PRD Section 8.
 */
export function buildWhatsAppMessage(data: BookingRequestData): string {
  const isFr = data.language === 'fr';

  const itemTitle = isFr ? data.itemTitle.fr : data.itemTitle.en;
  const optionTitle = data.optionTitle ? (isFr ? data.optionTitle.fr : data.optionTitle.en) : null;
  const itemLine = optionTitle ? `${itemTitle} — ${optionTitle}` : itemTitle;

  const dateTime = data.time ? `${data.date} à ${data.time}` : data.date;
  const dateTimeEn = data.time ? `${data.date} at ${data.time}` : data.date;

  if (isFr) {
    let msg = `Bonjour Riad Atlas Acacia, je souhaite demander :\n`;
    msg += `• ${itemLine}\n`;
    msg += `• Date : ${dateTime}\n`;
    msg += `• Voyageurs : ${data.guests}\n`;
    msg += `• Total estimé : ${data.price.mad} MAD / ${data.price.eur} €\n`;
    const roomDisplay =
      data.roomNumber === 'Pre-Arrival'
        ? 'Avant arrivée (Transfert / Premier soir)'
        : data.roomNumber === 'Outside Visitor'
        ? 'Client extérieur (Non-résident)'
        : data.roomNumber;
    msg += `• Nom / Chambre : ${data.guestName} / ${roomDisplay}\n`;

    if (data.flightNumber && data.flightNumber.trim()) {
      msg += `• Numéro de vol : ${data.flightNumber.trim()}\n`;
    }

    if (data.notes && data.notes.trim()) {
      msg += `• Remarques : ${data.notes.trim()}\n`;
    }

    if (data.mealSelections && data.mealSelections.length > 0) {
      msg += `\nChoix des repas :\n`;
      data.mealSelections.forEach((sel, idx) => {
        msg += `Voyageur ${idx + 1}: ${sel.starter || '-'} | ${sel.main || '-'} | ${sel.dessert || '-'}\n`;
      });
    }

    return msg.trim();
  } else {
    let msg = `Hello Riad Atlas Acacia, I'd like to request:\n`;
    msg += `• ${itemLine}\n`;
    msg += `• Date: ${dateTimeEn}\n`;
    msg += `• Guests: ${data.guests}\n`;
    msg += `• Estimated total: ${data.price.mad} MAD / ${data.price.eur} €\n`;
    const roomDisplayEn =
      data.roomNumber === 'Pre-Arrival'
        ? 'Pre-Arrival (Transfer / Arrival Night)'
        : data.roomNumber === 'Outside Visitor'
        ? 'Outside Visitor (Non-Resident)'
        : data.roomNumber;
    msg += `• Name / Room: ${data.guestName} / ${roomDisplayEn}\n`;

    if (data.flightNumber && data.flightNumber.trim()) {
      msg += `• Flight number: ${data.flightNumber.trim()}\n`;
    }

    if (data.notes && data.notes.trim()) {
      msg += `• Notes: ${data.notes.trim()}\n`;
    }

    if (data.mealSelections && data.mealSelections.length > 0) {
      msg += `\nMeal choices:\n`;
      data.mealSelections.forEach((sel, idx) => {
        msg += `Guest ${idx + 1}: ${sel.starter || '-'} | ${sel.main || '-'} | ${sel.dessert || '-'}\n`;
      });
    }

    return msg.trim();
  }
}

/**
 * Creates the full whatsapp web/app URL for a phone number and message.
 */
export function createWhatsAppLink(phoneNumber: string, message: string): string {
  // Strip non-digit characters
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedMsg}`;
}
