import {inject, TestBed} from '@angular/core/testing';

import {ListManagerService} from './list-manager.service';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {HttpLoaderFactory} from '../../app.module';
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
                        useFactory: HttpLoaderFactory,
                        deps: [HttpClient]
                    }
                }),
                NgSerializerModule.forRoot(),
                CoreModule
            ]
        });
    });

    it('should be created', inject([ListManagerService], (service: ListManagerService) => {
        expect(service).toBeTruthy();
    }));
});
