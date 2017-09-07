import {TestBed, inject} from '@angular/core/testing';

import {HtmlToolsService} from './html-tools.service';
import {I18nToolsService} from './i18n-tools.service';
import {TranslateModule, TranslateService} from '@ngx-translate/core';

describe('I18nToolsService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot()
            ],
            providers: [
                I18nToolsService
            ]
        });
    });

    it('should be created', inject([I18nToolsService], (service: I18nToolsService) => {
        expect(service).toBeTruthy();
    }));

    it('should create i18n name properly', inject([I18nToolsService], (service: I18nToolsService) => {
        expect(service.createI18nName({
            fr: {
                name: 'FR'
            },
            en: {
                name: 'EN'
            },
            de: {
                name: 'DE'
            },
            ja: {
                name: 'JA'
            },
        })).toEqual({
            fr: 'FR',
            en: 'EN',
            de: 'DE',
            ja: 'JA',
        });
    }));

    it('should be able to get name based on locale', inject([I18nToolsService, TranslateService],
        (service: I18nToolsService, translate: TranslateService) => {
            translate.use('en');
            const name = service.getName({
                fr: 'FR',
                en: 'EN',
                de: 'DE',
                ja: 'JA',
            });
            expect(name).toEqual('EN');
        }));
});
