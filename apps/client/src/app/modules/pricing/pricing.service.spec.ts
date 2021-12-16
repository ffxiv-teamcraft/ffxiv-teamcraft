import { inject, TestBed } from '@angular/core/testing';

import { PricingService } from './pricing.service';
import { ListRow } from '../list/model/list-row';
import { DataType } from '../list/data/data-type';


xdescribe('PricingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PricingService]
    });
  });

  it('should be created', inject([PricingService], (service: PricingService) => {
    expect(service).toBeTruthy();
  }));

  it('should be able to store a given price', inject([PricingService], (service: PricingService) => {
    const mockListRow = new ListRow();
    mockListRow.id = 12345;
    service.savePrice(mockListRow, { nq: 1450, hq: 0, fromVendor: false, fromMB: false });
    expect(service.getPrice(mockListRow).nq).toBe(1450);
  }));

  it('should be able to get default price for item bought in vendor', inject([PricingService], (service: PricingService) => {
    const row = new ListRow();
    row.id = 654987;
    row.sources = [
      {
        type: DataType.VENDORS,
        data: [{
          npcId: 123465,
          zoneId: 654987,
          price: 9001
        }]
      }
    ];
    expect(service.getPrice(row).nq).toBe(9001);
  }));

  it('should provide default value of 0 for unknown item', inject([PricingService], (service: PricingService) => {
    const row = new ListRow();
    row.id = 321654;
    expect(service.getPrice(row).nq).toBe(0);
    expect(service.getPrice(row).hq).toBe(0);
  }));

  it('should be able to store amount', inject([PricingService], (service: PricingService) => {
    const row = new ListRow();
    row.id = 2763;
    service.saveAmount('foo', row, { nq: 123, hq: 456 });
    expect(service.getAmount('foo', row).nq).toBe(123);
    expect(service.getAmount('foo', row).hq).toBe(456);
  }));

  it('should be able to return default amount', inject([PricingService], (service: PricingService) => {
    const row = new ListRow();
    row.id = 2763;
    row.amount = 123456;
    expect(service.getAmount('bar', row).nq).toBe(123456);
    expect(service.getAmount('bar', row).hq).toBe(0);
  }));
});
