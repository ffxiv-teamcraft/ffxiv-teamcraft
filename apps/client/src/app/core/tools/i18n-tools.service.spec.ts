import { CommonModule } from '@angular/common';
import { inject, TestBed } from '@angular/core/testing';
import { I18nToolsService } from './i18n-tools.service';
import { TranslateModule } from '@ngx-translate/core';

describe('I18nToolsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, TranslateModule.forRoot()],
      providers: [I18nToolsService]
    });
  });

  it('should be created', inject([I18nToolsService], (service: I18nToolsService) => {
    expect(service).toBeTruthy();
  }));

  it('should create i18n name properly', inject([I18nToolsService], (service: I18nToolsService) => {
    expect(
      service.createI18nName({
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
        zh: {
          name: 'ZH'
        },
        ko: {
          name: 'KO'
        }
      })
    ).toEqual({
      fr: 'FR',
      en: 'EN',
      de: 'DE',
      ja: 'JA',
      zh: 'ZH',
      ko: 'KO'
    });
  }));

  it('should be able to get name based on locale', inject([I18nToolsService], (service: I18nToolsService) => {
    const name = service.getName({
      fr: 'FR',
      en: 'EN',
      de: 'DE',
      ja: 'JA',
      zh: 'ZH',
      ko: 'KO'
    });
    expect(name).toEqual('EN');
  }));
});
