import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterAddPopupComponent } from './character-add-popup.component';

describe('CharacterAddPopupComponent', () => {
  let component: CharacterAddPopupComponent;
  let fixture: ComponentFixture<CharacterAddPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CharacterAddPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CharacterAddPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
