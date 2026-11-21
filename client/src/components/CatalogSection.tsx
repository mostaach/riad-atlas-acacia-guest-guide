import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Utensils,
  Compass,
  Sunset,
  Sparkles,
  Heart,
  ChevronRight,
  Clock,
  Car,
  Banknote,
  Search,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CatalogItem } from '@/lib/pricing';

interface CatalogSectionProps {
  categories: any[];
  items: CatalogItem[];
  language: 'en' | 'fr';
  primaryCurrency: 'MAD' | 'EUR';
  onSelectItem: (item: CatalogItem) => void;
}

export default function CatalogSection({
  categories,
  items,
  language,
  primaryCurrency,
  onSelectItem,
}: CatalogSectionProps) {
  const isFr = language === 'fr';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [spaGroup, setSpaGroup] = useState<'all' | 'hammam' | 'massage' | 'package'>('all');

  const filteredItems = items.filter(item => {
    if (selectedCategory !== 'all' && item.category_id !== selectedCategory) {
      return false;
    }
    if (selectedCategory === 'spa' && spaGroup !== 'all') {
      return (item as any).group === spaGroup;
    }
    return true;
  });

  const getStartingPrice = (item: CatalogItem) => {
    if (item.price) {
      return item.price;
    }
    if (item.base_price) {
      return item.base_price;
    }
    if (item.options && item.options.length > 0) {
      const prices = item.options
        .map(o => o.price || o.base_price)
        .filter(Boolean) as { mad: number; eur: number }[];
      if (prices.length > 0) {
        return prices.reduce((min, p) => (p.mad < min.mad ? p : min), prices[0]);
      }
    }
    return { mad: 0, eur: 0 };
  };

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'dining':
        return Utensils;
      case 'excursions':
        return Compass;
      case 'desert':
        return Sunset;
      case 'activities':
        return Sparkles;
      case 'spa':
        return Heart;
      default:
        return Sparkles;
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            selectedCategory === 'all'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-card border border-border text-foreground hover:bg-muted'
          }`}
        >
          {isFr ? 'Tous les services' : 'All Offers'}
        </button>

        {categories.map(cat => {
          const Icon = getCategoryIcon(cat.id);
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSpaGroup('all');
              }}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-card border border-border text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{isFr ? cat.title.fr : cat.title.en}</span>
            </button>
          );
        })}
      </div>

      {/* Spa sub-categories filter */}
      {selectedCategory === 'spa' && (
        <div className="flex items-center gap-2 p-1.5 bg-muted/60 rounded-xl w-fit">
          <button
            onClick={() => setSpaGroup('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              spaGroup === 'all' ? 'bg-background shadow-xs font-bold text-foreground' : 'text-muted-foreground'
            }`}
          >
            {isFr ? 'Tous' : 'All'}
          </button>
          <button
            onClick={() => setSpaGroup('hammam')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              spaGroup === 'hammam' ? 'bg-background shadow-xs font-bold text-foreground' : 'text-muted-foreground'
            }`}
          >
            {isFr ? 'Hammams' : 'Hammams'}
          </button>
          <button
            onClick={() => setSpaGroup('massage')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              spaGroup === 'massage' ? 'bg-background shadow-xs font-bold text-foreground' : 'text-muted-foreground'
            }`}
          >
            {isFr ? 'Massages' : 'Massages'}
          </button>
          <button
            onClick={() => setSpaGroup('package')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              spaGroup === 'package' ? 'bg-background shadow-xs font-bold text-foreground' : 'text-muted-foreground'
            }`}
          >
            {isFr ? 'Formules & Rituels' : 'Packages'}
          </button>
        </div>
      )}

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredItems.map(item => {
          const startPrice = getStartingPrice(item);
          return (
            <Card
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="group overflow-hidden rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="relative h-44 w-full overflow-hidden bg-muted">
                <img
                  src={item.image}
                  alt={isFr ? item.title.fr : item.title.en}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {item.cash_discount_applies && (
                  <div className="absolute top-3 left-3 bg-amber-500/90 text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1">
                    <Banknote className="w-3 h-3" />
                    <span>−10% Cash</span>
                  </div>
                )}

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-serif font-bold text-base sm:text-lg leading-snug drop-shadow-xs">
                    {isFr ? item.title.fr : item.title.en}
                  </h3>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {isFr
                    ? item.short_description?.fr || item.description?.fr
                    : item.short_description?.en || item.description?.en}
                </p>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                      {isFr ? 'À partir de' : 'From'}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-serif font-bold text-base text-primary">
                        {primaryCurrency === 'MAD'
                          ? `${startPrice.mad} MAD`
                          : `${startPrice.eur} €`}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        ({primaryCurrency === 'MAD' ? `${startPrice.eur} €` : `${startPrice.mad} MAD`})
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="rounded-xl text-xs font-semibold px-3 py-1 h-8 flex items-center gap-1 bg-primary text-primary-foreground group-hover:bg-primary/90"
                  >
                    <span>{isFr ? 'Réserver' : 'Book'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
