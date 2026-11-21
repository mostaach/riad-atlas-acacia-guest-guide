export interface Price {
  mad: number;
  eur: number;
}

export type PricingModel =
  | 'per_person'
  | 'base_plus_extra'
  | 'base_plus_extra_options'
  | 'options';

export interface CatalogOption {
  id: string;
  group?: string;
  title: { en: string; fr: string };
  price?: Price;
  unit?: 'per_person' | 'per_group' | 'per_2_people';
  base_pax?: number;
  base_price?: Price;
  extra_person?: Price;
}

export interface CatalogItem {
  id: string;
  category_id: string;
  title: { en: string; fr: string };
  short_description?: { en: string; fr: string };
  description?: { en: string; fr: string };
  image: string;
  pricing_model: PricingModel;
  price?: Price;
  base_pax?: number;
  base_price?: Price;
  extra_person?: Price;
  shared_minibus?: Price;
  options?: CatalogOption[];
  payment?: { method: 'cash_mad_to_driver' | 'pay_at_riad' | 'unspecified' };
  cash_discount_applies?: boolean;
  rules?: {
    service_hours?: string;
    min_lead_hours?: number;
    dinner_cutoff?: string;
    dinner_start?: string;
    timezone?: string;
  };
  meal_selection?: any;
}

export interface CalculatePriceParams {
  item: CatalogItem;
  guests: number;
  optionId?: string;
  sharedMinibus?: boolean;
}

export interface PriceResult {
  mad: number;
  eur: number;
}

/**
 * Pure function to calculate total MAD and EUR for any catalog item and party size.
 * Rules per PRD Section 5 & 7.
 */
export function calculatePrice({
  item,
  guests,
  optionId,
  sharedMinibus = false,
}: CalculatePriceParams): PriceResult {
  const safeGuests = Math.max(1, Math.floor(guests));

  switch (item.pricing_model) {
    case 'per_person': {
      if (!item.price) throw new Error(`Missing price for per_person item: ${item.id}`);
      return {
        mad: item.price.mad * safeGuests,
        eur: item.price.eur * safeGuests,
      };
    }

    case 'base_plus_extra': {
      if (sharedMinibus && item.shared_minibus) {
        return {
          mad: item.shared_minibus.mad * safeGuests,
          eur: item.shared_minibus.eur * safeGuests,
        };
      }

      if (!item.base_price || !item.extra_person || item.base_pax === undefined) {
        throw new Error(`Incomplete pricing definition for base_plus_extra item: ${item.id}`);
      }

      if (safeGuests <= item.base_pax) {
        return {
          mad: item.base_price.mad,
          eur: item.base_price.eur,
        };
      }

      const extraGuests = safeGuests - item.base_pax;
      return {
        mad: item.base_price.mad + extraGuests * item.extra_person.mad,
        eur: item.base_price.eur + extraGuests * item.extra_person.eur,
      };
    }

    case 'base_plus_extra_options': {
      const selectedOption = item.options?.find(o => o.id === optionId) || item.options?.[0];
      if (!selectedOption) {
        throw new Error(`Missing option for base_plus_extra_options item: ${item.id}`);
      }

      const basePax = selectedOption.base_pax ?? 2;
      const basePrice = selectedOption.base_price;
      const extraPerson = selectedOption.extra_person;

      if (!basePrice || !extraPerson) {
        throw new Error(`Incomplete pricing definition for option: ${selectedOption.id}`);
      }

      if (safeGuests <= basePax) {
        return {
          mad: basePrice.mad,
          eur: basePrice.eur,
        };
      }

      const extraGuests = safeGuests - basePax;
      return {
        mad: basePrice.mad + extraGuests * extraPerson.mad,
        eur: basePrice.eur + extraGuests * extraPerson.eur,
      };
    }

    case 'options': {
      const selectedOption = item.options?.find(o => o.id === optionId) || item.options?.[0];
      if (!selectedOption || !selectedOption.price) {
        throw new Error(`Missing or invalid option for item: ${item.id}`);
      }

      const unit = selectedOption.unit || 'per_person';

      if (unit === 'per_group') {
        return {
          mad: selectedOption.price.mad,
          eur: selectedOption.price.eur,
        };
      }

      if (unit === 'per_2_people') {
        const units = Math.ceil(safeGuests / 2);
        return {
          mad: selectedOption.price.mad * units,
          eur: selectedOption.price.eur * units,
        };
      }

      // Default: per_person
      return {
        mad: selectedOption.price.mad * safeGuests,
        eur: selectedOption.price.eur * safeGuests,
      };
    }

    default:
      throw new Error(`Unknown pricing model: ${(item as any).pricing_model}`);
  }
}
