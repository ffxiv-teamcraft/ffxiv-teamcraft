import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GatheredByPopupComponent} from './gathered-by-popup.component';

describe('GatheredByPopupComponent', () => {
    let component: GatheredByPopupComponent;
    let fixture: ComponentFixture<GatheredByPopupComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [GatheredByPopupComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GatheredByPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
