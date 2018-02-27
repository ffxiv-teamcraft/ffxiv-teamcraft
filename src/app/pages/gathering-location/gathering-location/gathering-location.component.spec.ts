import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GatheringLocationComponent } from './gathering-location.component';

describe('GatheringLocationComponent', () => {
  let component: GatheringLocationComponent;
  let fixture: ComponentFixture<GatheringLocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GatheringLocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatheringLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
