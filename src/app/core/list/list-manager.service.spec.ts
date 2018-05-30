import {inject, TestBed} from '@angular/core/testing';

import {ListManagerService} from './list-manager.service';
import {HttpClientModule} from '@angular/common/http';
import {TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {NgSerializerModule} from '@kaiu/ng-serializer';
import {I18nToolsService} from '../tools/i18n-tools.service';
import {GarlandToolsService} from '../api/garland-tools.service';
import {DataService} from '../api/data.service';
import {HtmlToolsService} from '../tools/html-tools.service';
import {EorzeanTimeService} from '../time/eorzean-time.service';
import {DataExtractorService} from './data/data-extractor.service';
import {DATA_EXTRACTORS} from '../core.module';
import {LocalizedDataService} from '../data/localized-data.service';

describe('ListManagerService', () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientModule,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useClass: TranslateFakeLoader
                    }
                }),
                NgSerializerModule.forRoot()
            ],
            providers: [
                GarlandToolsService,
                DataService,
                ListManagerService,
                HtmlToolsService,
                EorzeanTimeService,
                {provide: I18nToolsService, useFactory: () => new I18nToolsService({currentLang: 'en'} as TranslateService)},
                DataExtractorService,
                LocalizedDataService,
                ...DATA_EXTRACTORS
            ],
        });
    });

    it('should be created', inject([ListManagerService], (service: ListManagerService) => {
        expect(service).toBeTruthy();
    }));
});
