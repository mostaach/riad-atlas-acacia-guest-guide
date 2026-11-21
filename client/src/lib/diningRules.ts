export interface ValidationResult {
  valid: boolean;
  messageEn?: string;
  messageFr?: string;
}

/**
 * Validates dining booking requests against Riad rules (PRD Section 6 FR-7).
 * Rules:
 * - Service hours: 12:00 - 23:00
 * - Orders must be placed at least 4 hours in advance.
 * - Dinner orders (service at or after 18:00) must be placed before 16:00 same-day in Africa/Casablanca time.
 */
export function validateDiningOrder(
  requestedDateStr: string, // YYYY-MM-DD
  requestedTimeStr: string, // HH:MM
  currentTime?: Date
): ValidationResult {
  if (!requestedDateStr || !requestedTimeStr) {
    return {
      valid: false,
      messageEn: 'Please select both date and time for dining.',
      messageFr: 'Veuillez sélectionner la date et l’heure du repas.',
    };
  }

  // Parse time
  const [reqHour, reqMinute] = requestedTimeStr.split(':').map(Number);
  if (isNaN(reqHour) || isNaN(reqMinute)) {
    return {
      valid: false,
      messageEn: 'Invalid time format.',
      messageFr: 'Format d’heure invalide.',
    };
  }

  // Check service hours: 12:00 to 23:00
  if (reqHour < 12 || reqHour > 23 || (reqHour === 23 && reqMinute > 0)) {
    return {
      valid: false,
      messageEn: 'Our dining service is available between 12:00 and 23:00.',
      messageFr: 'Notre service de restauration est ouvert de midi à 23h00.',
    };
  }

  // Current time in Casablanca
  const now = currentTime || new Date();
  const casablancaFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Casablanca',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = casablancaFormatter.formatToParts(now);
  const partMap: Record<string, string> = {};
  parts.forEach(p => (partMap[p.type] = p.value));

  const casaYear = parseInt(partMap.year);
  const casaMonth = parseInt(partMap.month) - 1;
  const casaDay = parseInt(partMap.day);
  const casaHour = parseInt(partMap.hour);
  const casaMinute = parseInt(partMap.minute);

  const [reqYear, reqMonth, reqDay] = requestedDateStr.split('-').map(Number);
  const isSameDay =
    reqYear === casaYear && reqMonth - 1 === casaMonth && reqDay === casaDay;

  const targetDateCasa = new Date(Date.UTC(reqYear, reqMonth - 1, reqDay, reqHour, reqMinute));
  const currentDateCasa = new Date(Date.UTC(casaYear, casaMonth, casaDay, casaHour, casaMinute));

  // Difference in hours
  const diffHours = (targetDateCasa.getTime() - currentDateCasa.getTime()) / (1000 * 60 * 60);

  if (diffHours < 0) {
    return {
      valid: false,
      messageEn: 'Selected date and time is in the past.',
      messageFr: 'La date et l’heure sélectionnées sont déjà passées.',
    };
  }

  // Rule: min lead 4 hours
  if (diffHours < 4) {
    return {
      valid: false,
      messageEn: 'Orders must be placed at least 4 hours in advance to allow fresh preparation.',
      messageFr: 'Les commandes doivent être passées au moins 4 heures à l’avance pour une préparation fraîche du marché.',
    };
  }

  // Rule: Dinner orders (from 18:00) must be placed before 16:00
  const isDinner = reqHour >= 18;
  if (isDinner && isSameDay) {
    if (casaHour > 16 || (casaHour === 16 && casaMinute > 0)) {
      return {
        valid: false,
        messageEn: 'Same-day dinner orders must be placed before 16:00.',
        messageFr: 'Pour le dîner du jour même, les commandes doivent être passées avant 16h00.',
      };
    }
  }

  return { valid: true };
}
