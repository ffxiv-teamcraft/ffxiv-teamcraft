import { I18nToolsService } from './i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';

describe('I18nToolsService', () => {
  let service: I18nToolsService;

  beforeEach(() => {
    service = new I18nToolsService({ currentLang: 'en' } as TranslateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create i18n name properly', () => {
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
      zh: {
        name: 'ZH'
      },
      ko: {
        name: 'KO'
      }
    })).toEqual({
      fr: 'FR',
      en: 'EN',
      de: 'DE',
      ja: 'JA',
      zh: 'ZH',
      ko: 'KO'
    });
  });

  it('should be able to get name based on locale', () => {
    const name = service.getName({
      fr: 'FR',
      en: 'EN',
      de: 'DE',
      ja: 'JA',
      zh: 'ZH',
      ko: 'KO'
    });
    expect(name).toEqual('EN');
  });
});
