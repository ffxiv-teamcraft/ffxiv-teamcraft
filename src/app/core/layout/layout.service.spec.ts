import {inject, TestBed} from '@angular/core/testing';

import {LayoutService} from './layout.service';
import {ListRow} from '../../model/list/list-row';
import {mockList} from '../../../test/mock-list';
import {LayoutRowFilter} from './layout-row-filter';
import {NgSerializerModule} from '@kaiu/ng-serializer';
import {LayoutOrderService} from './layout-order.service';
import {TranslateService} from '@ngx-translate/core';
import {CoreModule} from '../core.module';

const mockRows: ListRow[] = mockList.items;

function testFilter(filter: LayoutRowFilter): void {
    const result = filter.filter(mockRows);
    expect(result.accepted.length).toBeGreaterThan(0);
    expect(result.rejected.length).toBeGreaterThan(0);
    expect(filter.filter(result.rejected).accepted.length).toBe(0);
}

class MockTranslate extends TranslateService {
    currentLang = 'en';
}

xdescribe('LayoutService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                LayoutService,
                LayoutOrderService,
                {provide: TranslateService, useValue: MockTranslate},
            ],
            imports: [
                NgSerializerModule.forRoot(),
                CoreModule
            ]
        });
    });

    it('should be created', inject([LayoutService], (service: LayoutService) => {
        expect(service).toBeTruthy();
    }));

    it('should have working filters', () => {
        testFilter(LayoutRowFilter.IS_CRAFT);
        testFilter(LayoutRowFilter.IS_GATHERING);
        testFilter(LayoutRowFilter.IS_TIMED);
    });

    it('should have working filter combinations', () => {
        const filter = LayoutRowFilter.IS_CRAFT.or(LayoutRowFilter.IS_GATHERING);
        testFilter(filter);
        const crafts = LayoutRowFilter.IS_CRAFT.filter(mockRows);
        const gatherings = LayoutRowFilter.IS_GATHERING.filter(mockRows);
        expect(filter.filter(mockRows).accepted.length).toBe(crafts.accepted.length + gatherings.accepted.length);
    });

    it('should be able to build filter from a string', () => {
        const compareTo = LayoutRowFilter.IS_CRAFT.or(LayoutRowFilter.IS_GATHERING).filter(mockRows).accepted.length;
        const filter = LayoutRowFilter.fromString('IS_CRAFT:or:IS_GATHERING');
        expect(filter.filter(mockRows).accepted.length).toBe(compareTo);
        expect(filter.name).toEqual(LayoutRowFilter.IS_CRAFT.or(LayoutRowFilter.IS_GATHERING).name);
        expect(LayoutRowFilter.IS_TIMED.name).toEqual('IS_TIMED');
    });

    it('should be able to build proper string for large filter chains', () => {
        expect(LayoutRowFilter.IS_CRAFT
            .and(LayoutRowFilter.IS_GATHERING)
            .or(LayoutRowFilter.IS_CRAFT)
            .name)
            .toEqual('IS_CRAFT:and:IS_GATHERING:or:IS_CRAFT');
    });

    it('should be able to support NOT logic gate', () => {
        const filterChain = LayoutRowFilter.IS_GATHERING.and(LayoutRowFilter.not(LayoutRowFilter.CAN_BE_BOUGHT));
        const opposedFilterChain = LayoutRowFilter.not(LayoutRowFilter.IS_GATHERING).or(LayoutRowFilter.CAN_BE_BOUGHT);
        expect(filterChain.name).toEqual('IS_GATHERING:and:!CAN_BE_BOUGHT');

        expect(filterChain.filter(mockRows).accepted.length).toEqual(opposedFilterChain.filter(mockRows).rejected.length);
    });
});
