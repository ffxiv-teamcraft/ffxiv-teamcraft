import {inject, TestBed} from '@angular/core/testing';

import {ListManagerService} from './list-manager.service';
import {HttpClientModule} from '@angular/common/http';
import {TranslateFakeLoader, TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {NgSerializerModule} from '@kaiu/ng-serializer';
import {CoreModule} from '../core.module';

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
                NgSerializerModule.forRoot(),
                CoreModule
            ],
        });
    });

    it('should be created', inject([ListManagerService], (service: ListManagerService) => {
        expect(service).toBeTruthy();
    }));
});
