import {inject, TestBed} from '@angular/core/testing';

import {SettingsService} from './settings.service';

describe('OptionsService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SettingsService]
        });
    });

    it('should be created', inject([SettingsService], (service: SettingsService) => {
        expect(service).toBeTruthy();
    }));

    it('should be able to store base link data', inject([SettingsService], (service: SettingsService) => {
        service.baseLink = 'XIVDB';
        expect(service.baseLink).toBe('XIVDB');
    }));
});
