import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeEmailPopupComponent } from './change-email-popup.component';

describe('ChangeEmailPopupComponent', () => {
  let component: ChangeEmailPopupComponent;
  let fixture: ComponentFixture<ChangeEmailPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeEmailPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeEmailPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
