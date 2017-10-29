import {async, inject, TestBed} from '@angular/core/testing';

import {MapService} from './map.service';
import {HttpClientModule} from '@angular/common/http';

describe('MapService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            providers: [MapService]
        });
    });

    it('should be created', inject([MapService], (service: MapService) => {
        expect(service).toBeTruthy();
    }));

    it('should return proper map', async(inject([MapService], (service: MapService) => {
        service.getMapById(31).subscribe(map => {
            expect(map).toEqual({
                'id': 16,
                'folder': 's1f2/00',
                'path': 's1f2/s1f2.00.png',
                'region': 'La Noscea',
                'placename': 'Lower La Noscea',
                'zone': 0,
                'size_factor': 100,
                'offset_x': 0,
                'offset_y': 0,
                'map_marker_range': 75,
                'hierarchy': 1,
                'territory_id': 135,
                'patch': 0,
                'image': 'https://secure.xivdb.com/img/maps/s1f2/s1f2.00.jpg',
                'layer_count': 1,
                'placename_id': 31,
                'region_id': 22
            });
        });
    })));
});
