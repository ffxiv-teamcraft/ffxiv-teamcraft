import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeDetailsPopupComponent } from './trade-details-popup.component';

describe('TradeDetailsPopupComponent', () => {
  let component: TradeDetailsPopupComponent;
  let fixture: ComponentFixture<TradeDetailsPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TradeDetailsPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeDetailsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
