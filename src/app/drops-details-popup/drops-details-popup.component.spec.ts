import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropsDetailsPopupComponent } from './drops-details-popup.component';

describe('DropsDetailsPopupComponent', () => {
  let component: DropsDetailsPopupComponent;
  let fixture: ComponentFixture<DropsDetailsPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropsDetailsPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropsDetailsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
