import { TestBed } from '@angular/core/testing';
import { MarketboardHistory } from './marketboard-history';
import { MarketboardPrice } from './marketboard-price';
import { MarketPriceService, PriceModeOption } from './market-price.service';

describe('MarketPriceService', () => {
  let service: MarketPriceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MarketPriceService]
    });
    service = TestBed.inject(MarketPriceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // PurchaseDate is seconds since epoch, the injected `now` is milliseconds
  const nowMs = 1704672000000; // 2024-01-08T00:00:00Z
  const nowSec = nowMs / 1000;
  const day = 86400;

  const sale = (price: number, quantity: number, hq: boolean, purchaseDate: number): MarketboardHistory => ({
    Added: 0,
    CharacterID: '',
    CharacterName: '',
    ID: '',
    IsHQ: hq,
    PricePerUnit: price,
    PriceTotal: price * quantity,
    PurchaseDate: purchaseDate,
    PurchaseDateMS: '',
    Quantity: quantity,
  });

  const listing = (price: number, hq: boolean): MarketboardPrice => ({
    Added: 0,
    CreatorSignatureID: '',
    CraftSignature: '',
    ID: '',
    IsCrafted: false,
    IsHQ: hq,
    Materia: [],
    PricePerUnit: price,
    PriceTotal: price,
    Quantity: 1,
    RetainerID: '',
    RetainerName: '',
    StainID: 0,
    TownID: 0,
  });

  it('should only price the HQ/NQ kind the entry is, not both mixed', () => {
    const mixed = [
      sale(100, 1, false, nowSec),
      sale(900, 1, true, nowSec),
    ];
    expect(service.calculatePrice(mixed, 'lowest', true)).toBe(900);
    expect(service.calculatePrice(mixed, 'lowest', false)).toBe(100);
  });

  it('should return whole gils even when a statistic lands on a fraction', () => {
    // median of [100, 101] is 100.5
    expect(service.calculatePrice([sale(100, 1, true, nowSec), sale(101, 1, true, nowSec)], 'median', true)).toBe(100);
  });

  it('should weight a sale from 7 days ago at half the weight of a recent one', () => {
    const history = [
      sale(1000, 1, true, nowSec - 7 * day),
      sale(2000, 1, true, nowSec),
    ];
    // (1000 * 0.5 + 2000 * 1) / 1.5 = 1666.6
    expect(service.calculatePrice(history, 'recencyWeighted', true, nowMs)).toBe(1666);
  });

  it('should clamp sales dated in the future instead of inverting their weight', () => {
    const history = [sale(5000, 1, true, nowSec + 10 * day)];
    expect(service.calculatePrice(history, 'recencyWeighted', true, nowMs)).toBe(5000);
  });

  it('should return the quantity-weighted cost per unit', () => {
    const history = [
      sale(100, 1, true, nowSec),
      sale(900, 8, true, nowSec),
    ];
    // (100 + 7200) / 9 = 811.1
    expect(service.calculatePrice(history, 'weighted', true)).toBe(811);
  });

  it('should return the most expensive sale for p95 on a tiny sample', () => {
    const history = [
      sale(100, 1, true, nowSec),
      sale(200, 1, true, nowSec),
      sale(300, 1, true, nowSec),
    ];
    expect(service.calculatePrice(history, 'p95', true)).toBe(300);
  });

  it('should return 0 when there are no sales of the requested kind', () => {
    const nqOnly = [sale(100, 1, false, nowSec)];
    expect(service.calculatePrice(nqOnly, 'average', true)).toBe(0);
    expect(service.calculatePrice([], 'average', true)).toBe(0);
    expect(service.calculatePrice(null, 'average', true)).toBe(0);
  });

  it('should reject currentListing instead of silently pricing it as lowest', () => {
    expect(() => service.calculatePrice([sale(100, 1, true, nowSec)], 'currentListing', true))
      .toThrow('currentListing');
  });

  it('should only read listings of the requested kind', () => {
    const mixed = [
      listing(500, false),
      listing(800, true),
    ];
    expect(service.getCurrentListingPrice(mixed, true)).toBe(800);
    expect(service.getCurrentListingPrice(mixed, false)).toBe(500);
    expect(service.getCurrentListingPrice([], true)).toBe(0);
  });

  it('should offer one option per price mode', () => {
    const options = service.getModeOptions();
    expect(options.length).toBe(7);
    expect(options.map((o: PriceModeOption) => o.key)).toEqual(
      ['lowest', 'average', 'median', 'weighted', 'p95', 'recencyWeighted', 'currentListing']
    );
  });
});
