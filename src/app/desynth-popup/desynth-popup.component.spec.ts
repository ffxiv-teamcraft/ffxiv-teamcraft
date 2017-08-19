import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesynthPopupComponent } from './desynth-popup.component';

describe('DesynthPopupComponent', () => {
  let component: DesynthPopupComponent;
  let fixture: ComponentFixture<DesynthPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesynthPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesynthPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
