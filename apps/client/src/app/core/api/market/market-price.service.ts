import { Injectable } from '@angular/core';
import { MarketboardHistory } from './marketboard-history';
import { MarketboardPrice } from './marketboard-price';

export type PriceCalculationMode =
  | 'lowest'
  | 'average'
  | 'median'
  | 'weighted'
  | 'p95'
  | 'recencyWeighted'
  | 'currentListing';

export interface PriceModeOption {
  key: PriceCalculationMode;
  labelKey: string;
  descriptionKey: string;
}

@Injectable({ providedIn: 'root' })
export class MarketPriceService {

  /** Half-life in seconds for recency weighting (7 days) */
  private static readonly RECENCY_HALF_LIFE_SEC = 7 * 24 * 60 * 60;

  getModeOptions(): PriceModeOption[] {
    return [
      { key: 'lowest', labelKey: 'CURRENCY_SPENDING.Mode_lowest', descriptionKey: 'CURRENCY_SPENDING.Mode_desc_lowest' },
      { key: 'average', labelKey: 'CURRENCY_SPENDING.Mode_average', descriptionKey: 'CURRENCY_SPENDING.Mode_desc_average' },
      { key: 'median', labelKey: 'CURRENCY_SPENDING.Mode_median', descriptionKey: 'CURRENCY_SPENDING.Mode_desc_median' },
      { key: 'weighted', labelKey: 'CURRENCY_SPENDING.Mode_weighted', descriptionKey: 'CURRENCY_SPENDING.Mode_desc_weighted' },
      { key: 'p95', labelKey: 'CURRENCY_SPENDING.Mode_p95', descriptionKey: 'CURRENCY_SPENDING.Mode_desc_p95' },
      { key: 'recencyWeighted', labelKey: 'CURRENCY_SPENDING.Mode_recency_weighted', descriptionKey: 'CURRENCY_SPENDING.Mode_desc_recency_weighted' },
      { key: 'currentListing', labelKey: 'CURRENCY_SPENDING.Mode_current_listing', descriptionKey: 'CURRENCY_SPENDING.Mode_desc_current_listing' },
    ];
  }

  /**
   * Calculate the price for a single item based on the selected mode.
   * Uses historical sales data (History) for all modes except 'currentListing'.
   *
   * History holds HQ and NQ rows for the same item, so `hq` picks the kind the
   * entry is actually priced as - mixing the two makes every statistic below
   * meaningless (an HQ item's median landing on an NQ sale).
   * `now` is injectable so the recency modes can be tested against a fixed clock.
   */
  calculatePrice(history: MarketboardHistory[], mode: PriceCalculationMode, hq: boolean, now: number = Date.now()): number {
    if (mode === 'currentListing') {
      throw new Error("'currentListing' reads active listings, use getCurrentListingPrice instead");
    }

    const sales = (history || []).filter(h => h.IsHQ === hq);
    if (sales.length === 0) {
      return 0;
    }

    let price: number;
    switch (mode) {
      case 'lowest':
        price = this.lowestPrice(sales);
        break;
      case 'average':
        price = this.averagePrice(sales);
        break;
      case 'median':
        price = this.medianPrice(sales);
        break;
      case 'weighted':
        price = this.weightedPrice(sales);
        break;
      case 'p95':
        price = this.percentilePrice(sales, 95);
        break;
      case 'recencyWeighted':
        price = this.recencyWeightedPrice(sales, now);
        break;
      default:
        throw new Error(`Unknown price mode: ${mode}`);
    }

    // Gils are whole numbers: median of an even count and the recency average both land on fractions
    return Math.floor(price);
  }

  /**
   * Get the current active listing price (cheapest sell order).
   * This uses active listings (Prices) instead of historical sales.
   */
  getCurrentListingPrice(prices: MarketboardPrice[], hq: boolean): number {
    const listings = (prices || []).filter(p => p.IsHQ === hq);
    if (listings.length === 0) {
      return 0;
    }
    return Math.min(...listings.map(p => p.PricePerUnit));
  }

  // ---- Private calculation methods ----
  // All of them run on rows already narrowed to a single HQ/NQ kind.

  private lowestPrice(history: MarketboardHistory[]): number {
    return Math.min(...history.map(h => h.PricePerUnit));
  }

  private averagePrice(history: MarketboardHistory[]): number {
    const sum = history.reduce((acc, h) => acc + h.PricePerUnit, 0);
    return sum / history.length;
  }

  private medianPrice(history: MarketboardHistory[]): number {
    const sorted = [...history.map(h => h.PricePerUnit)].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
  }

  /**
   * Quantity-weighted average: each sale's price is weighted by its quantity.
   * This represents the "typical cost per unit" across total volume.
   */
  private weightedPrice(history: MarketboardHistory[]): number {
    let totalQuantity = 0;
    let totalValue = 0;
    for (const h of history) {
      totalQuantity += h.Quantity;
      totalValue += h.PricePerUnit * h.Quantity;
    }
    return totalQuantity === 0 ? 0 : totalValue / totalQuantity;
  }

  /**
   * Nth percentile price: N% of historical sales were at or below this price.
   * P95 is useful for understanding worst-case typical pricing.
   */
  private percentilePrice(history: MarketboardHistory[], percentile: number): number {
    const sorted = [...history.map(h => h.PricePerUnit)].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Exponential decay weighted by recency.
   * More recent sales contribute more to the average.
   * Uses a half-life of 7 days: a sale that was 7 days ago
   * contributes half as much as a sale from today.
   */
  private recencyWeightedPrice(history: MarketboardHistory[], now: number): number {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const h of history) {
      // PurchaseDate is seconds since epoch, `now` is milliseconds
      const ageSeconds = Math.max(now / 1000 - h.PurchaseDate, 0);

      const weight = Math.exp(-0.693 * ageSeconds / MarketPriceService.RECENCY_HALF_LIFE_SEC);

      weightedSum += h.PricePerUnit * weight;
      totalWeight += weight;
    }

    return totalWeight === 0 ? 0 : weightedSum / totalWeight;
  }
}
