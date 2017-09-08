import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ListNamePopupComponent} from './list-name-popup.component';

describe('ListNamePopupComponent', () => {
    let component: ListNamePopupComponent;
    let fixture: ComponentFixture<ListNamePopupComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ListNamePopupComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ListNamePopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
