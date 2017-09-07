import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorsDetailsPopupComponent } from './vendors-details-popup.component';

describe('VendorsDetailsPopupComponent', () => {
  let component: VendorsDetailsPopupComponent;
  let fixture: ComponentFixture<VendorsDetailsPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VendorsDetailsPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorsDetailsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
