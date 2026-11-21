import { describe, it, expect } from 'vitest';
import { calculatePrice } from './index';
import catalogData from '../../../../data/riads/riad-atlas-acacia/catalog.json';

describe('Pricing Engine - PRD Section 7 Acceptance Tests', () => {
  const getItem = (id: string) => {
    const item = catalogData.items.find((i: any) => i.id === id);
    if (!item) throw new Error(`Item ${id} not found in catalog`);
    return item as any;
  };

  it('Case 1: Ourika taxi, 2 guests -> Expected MAD 1100, Expected EUR 99', () => {
    const item = getItem('ourika-valley');
    const result = calculatePrice({ item, guests: 2, sharedMinibus: false });
    expect(result).toEqual({ mad: 1100, eur: 99 });
  });

  it('Case 2: Ourika taxi, 4 guests -> Expected MAD 1254, Expected EUR 113', () => {
    const item = getItem('ourika-valley');
    const result = calculatePrice({ item, guests: 4, sharedMinibus: false });
    expect(result).toEqual({ mad: 1254, eur: 113 });
  });

  it('Case 3: Ourika shared minibus, 3 guests -> Expected MAD 825, Expected EUR 75', () => {
    const item = getItem('ourika-valley');
    const result = calculatePrice({ item, guests: 3, sharedMinibus: true });
    expect(result).toEqual({ mad: 825, eur: 75 });
  });

  it('Case 4: Imlil taxi, 1 guest -> Expected MAD 1100, Expected EUR 99', () => {
    const item = getItem('imlil-toubkal');
    const result = calculatePrice({ item, guests: 1 });
    expect(result).toEqual({ mad: 1100, eur: 99 });
  });

  it('Case 5: Cooking class, 3 guests -> Expected MAD 1210, Expected EUR 110', () => {
    const item = getItem('cooking-class');
    const result = calculatePrice({ item, guests: 3 });
    expect(result).toEqual({ mad: 1210, eur: 110 });
  });

  it('Case 6: Medina guide half day, 5 guests -> Expected MAD 990, Expected EUR 90', () => {
    const item = getItem('medina-guided-tour');
    const result = calculatePrice({ item, guests: 5, optionId: 'half-day' });
    expect(result).toEqual({ mad: 990, eur: 90 });
  });

  it('Case 7: Meal formula, 3 guests -> Expected MAD 660, Expected EUR 60', () => {
    const item = getItem('meal-formula');
    const result = calculatePrice({ item, guests: 3 });
    expect(result).toEqual({ mad: 660, eur: 60 });
  });

  it('Case 8: Hot-air balloon, 2 guests -> Expected MAD 3600, Expected EUR 328', () => {
    const item = getItem('hot-air-balloon');
    const result = calculatePrice({ item, guests: 2 });
    expect(result).toEqual({ mad: 3600, eur: 328 });
  });

  it('Case 9: Agafay lunch + 2h quad, 2 guests -> Expected MAD 1600, Expected EUR 146', () => {
    const item = getItem('agafay-desert');
    const result = calculatePrice({ item, guests: 2, optionId: 'lunch-quad' });
    expect(result).toEqual({ mad: 1600, eur: 146 });
  });

  it('Case 10: Zagora luxury tent, 4 guests -> Expected MAD 4800, Expected EUR 436', () => {
    const item = getItem('zagora-desert-tour');
    const result = calculatePrice({ item, guests: 4, optionId: 'luxury-tent' });
    expect(result).toEqual({ mad: 4800, eur: 436 });
  });

  it('Case 11: Agafay tent night, 2200 MAD / 200 EUR per person confirmed', () => {
    const item = getItem('agafay-desert');
    const result1Pax = calculatePrice({ item, guests: 1, optionId: 'tent-night' });
    expect(result1Pax).toEqual({ mad: 2200, eur: 200 });

    const result2Pax = calculatePrice({ item, guests: 2, optionId: 'tent-night' });
    expect(result2Pax).toEqual({ mad: 4400, eur: 400 });
  });
});
