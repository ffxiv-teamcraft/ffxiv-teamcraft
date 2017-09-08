import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {InstancesDetailsPopupComponent} from './instances-details-popup.component';

describe('InstancesDetailsPopupComponent', () => {
    let component: InstancesDetailsPopupComponent;
    let fixture: ComponentFixture<InstancesDetailsPopupComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [InstancesDetailsPopupComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InstancesDetailsPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
