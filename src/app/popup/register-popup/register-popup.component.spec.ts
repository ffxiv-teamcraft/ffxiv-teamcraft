import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterPopupComponent } from './register-popup.component';

describe('RegisterPopupComponent', () => {
  let component: RegisterPopupComponent;
  let fixture: ComponentFixture<RegisterPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
