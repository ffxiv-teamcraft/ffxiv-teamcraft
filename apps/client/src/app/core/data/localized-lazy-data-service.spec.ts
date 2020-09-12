import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { inject, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { PlatformService } from '../tools/platform.service';
import { LazyDataProviderService } from './lazy-data-provider.service';
import { LocalizedLazyDataService } from './localized-lazy-data.service';
import { zhWorlds } from './sources/zh-worlds';
import { lazyFilesList } from './lazy-files-list';
import { LazyDataKey } from './lazy-data';
import { I18nNameLazy } from '../../model/common/i18n-name-lazy';
import { Language } from './language';

const languages = ['en', 'fr', 'ja', 'de', 'ko', 'zh'] as const; // Not testing ru consistently, as it is not widely availabe (and we'd be testing that it falls back to en)

/**
 * Loads a non-extended-language json resource.
 * Note that this must remain separate from the other load function, as the path names must be statically analyzable for webpack to include the resources in the bundle.
 * @param key The lazy data key to load data for.
 */
const loadStd = async (key: LazyDataKey) => {
  return await import('../../../assets/data/' + lazyFilesList[key].fileName);
};

/**
 * Loads an extended-language json resource.
 * Note that this must remain separate from the other load function, as the path names must be statically analyzable for webpack to include the resources in the bundle.
 * @param key The lazy data key to load data for.
 */
const loadExt = async (key: LazyDataKey) => {
  return await import('../../../assets/data' + lazyFilesList[key].fileName);
};

const basicJsonAccessor = (data: any, id: string | number, lang: Language): string => data[id][lang];
type JsonAccessor = typeof basicJsonAccessor;

/**
 * Creates a basic test runner for quickly validating LocalizedLazyDataService methods whose backing json data is structured as I18nNames.
 * For a given id, lazy data key, and list of languages to test, validates that the provided function returns an I18nLazy whose values of those languages
 * resolve to the actual values in the json data.
 * @param getLazyName The function that loads the I18nLazyName.
 * @param
 */
const makeBasicTestRunner = (getLazyName: (id: number | string) => I18nNameLazy, key: LazyDataKey, jsonAccessor: JsonAccessor = basicJsonAccessor) => async (
  id: number | string,
  lang: readonly Language[] = languages
) => {
  const stdData = await loadStd(key);
  const koData = lang.includes('ko') ? await loadExt(`ko${key.charAt(0).toUpperCase()}${key.substr(1)}` as LazyDataKey) : undefined;
  const zhData = lang.includes('zh') ? await loadExt(`zh${key.charAt(0).toUpperCase()}${key.substr(1)}` as LazyDataKey) : undefined;
  const lazyData = await forkJoin(getLazyName(id)).toPromise();
  for (const l of lang) {
    switch (l) {
      case 'ko':
        expect(lazyData[l]).toBe(jsonAccessor(koData, id, l));
        break;
      case 'zh':
        expect(lazyData[l]).toBe(jsonAccessor(zhData, id, l));
        break;
      default:
        expect(lazyData[l]).toBe(jsonAccessor(stdData, id, l));
    }
  }
};

describe('LocalizedLazyDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, TranslateModule.forRoot(), HttpClientModule],
      providers: [LazyDataProviderService, PlatformService, LocalizedLazyDataService],
    });
  });

  it('should be created', inject([LocalizedLazyDataService], (service: LocalizedLazyDataService) => {
    expect(service).toBeTruthy();
  }));

  it('should get i18n world name', inject([LocalizedLazyDataService], async (service: LocalizedLazyDataService) => {
    const n1 = 'Faerie';
    const w1 = service.getWorldName(n1);
    const r1 = await forkJoin(w1).toPromise();
    for (const l of languages) {
      expect(r1[l]).toBe(n1);
    }

    const n2 = 'BaiJinHuanXiang';
    const w2 = service.getWorldName(n2);
    const r2 = await forkJoin(w2).toPromise();
    for (const l of languages) {
      if (l === 'zh') expect(r2[l]).toBe(zhWorlds[n2]);
      else expect(r2[l]).toBe(n2);
    }
  }));

  it('should get i18n item', inject([LocalizedLazyDataService], async (service: LocalizedLazyDataService) => {
    const runBasicTest = makeBasicTestRunner(service.getItem.bind(service), 'items');
    for (const id of [1, 2, 3, 4]) {
      await runBasicTest(id);
    }
  }));

  it('should get i18n race name', inject([LocalizedLazyDataService], async (service: LocalizedLazyDataService) => {
    const runBasicTest = makeBasicTestRunner(service.getRaceName.bind(service), 'races');
    for (const id of [1, 2, 3, 4]) {
      await runBasicTest(id);
    }
  }));

  it('should gracefully fallback to en when unavailabe', inject([LocalizedLazyDataService], async (service: LocalizedLazyDataService) => {
    const id = 1;
    const item = await forkJoin(service.getItem(id)).toPromise();
    const enItems = await loadStd('items');
    expect(item['ru']).not.toBeUndefined();
    expect(item['ru']).toBe(enItems[id]['en']);
  }));

  it('should get i18n fate', inject([LocalizedLazyDataService], async (service: LocalizedLazyDataService) => {
    const id = 120;
    const fate = await service.getFate(id).toPromise();
    const koFates = await loadExt('koFates');
    const zhFates = await loadExt('zhFates');
    const enFates = await loadStd('fates');
    expect(fate.icon).toBeTruthy();
    expect(fate.level).toBeTruthy();
    expect(fate.icon).toBe(enFates[id].icon);
    expect(fate.level).toBe(enFates[id].level);
    const name = await forkJoin(fate.name).toPromise();
    const desc = await forkJoin(fate.description).toPromise();
    for (const l of languages) {
      switch (l) {
        case 'ko':
          expect(name[l]).toBe(koFates[id].name[l]);
          expect(desc[l]).toBe(koFates[id].description[l]);
          break;
        case 'zh':
          expect(name[l]).toBe(zhFates[id].name[l]);
          expect(desc[l]).toBe(zhFates[id].description[l]);
          break;
        default:
          expect(name[l]).toBe(enFates[id].name[l]);
          expect(desc[l]).toBe(enFates[id].description[l]);
      }
    }
  }));

  it('should get i18n npc', inject([LocalizedLazyDataService], async (service: LocalizedLazyDataService) => {
    const id = 1000236;
    const npc = await service.getNpc(id).toPromise();
    const koNpc = await loadExt('koNpcs');
    const zhNpc = await loadExt('zhNpcs');
    const enNpc = await loadStd('npcs');
    expect(npc.defaultTalks).toBeTruthy();
    const name = await forkJoin({ en: npc.en, de: npc.de, fr: npc.fr, ja: npc.ja, ko: npc.ko, zh: npc.zh }).toPromise();
    for (const l of languages) {
      switch (l) {
        case 'ko':
          expect(name[l]).toBe(koNpc[id][l]);
          break;
        case 'zh':
          expect(name[l]).toBe(zhNpc[id][l]);
          break;
        default:
          expect(name[l]).toBe(enNpc[id][l]);
      }
    }
  }));

  it('should get i18n shops by english name', inject([LocalizedLazyDataService], async (service: LocalizedLazyDataService) => {
    const enShop = await loadStd('shops');
    const accessor: JsonAccessor = (data, name, lang) => {
      const id = +Object.keys(enShop).find((k) => enShop[k].en === name);
      return data[id][lang];
    };
    const runBasicTest = makeBasicTestRunner(service.getShopName.bind(service), 'shops', accessor);
    for (const id of [1769739, 1769740, 1769741]) {
      const name = enShop[id].en;
      await runBasicTest(name);
    }
  }));

  it('should get i18n traits', inject([LocalizedLazyDataService], async (service: LocalizedLazyDataService) => {
    const id = 33;
    const koTrait = await loadExt('koTraits');
    const zhTrait = await loadExt('zhTraits');
    const koTraitDesc = await loadExt('koTraitDescriptions');
    const zhTraitDesc = await loadExt('zhTraitDescriptions');
    const enTrait = await loadStd('traits');
    const trait = await service.getTrait(id).toPromise();
    for (const l of [...languages, 'ru']) {
      const name = await trait[l].toPromise();
      const desc = await trait.description[l].toPromise();
      expect(name).toBeTruthy();
      expect(desc).toBeTruthy();
      switch (l) {
        case 'ko':
          expect(name).toBe(koTrait[id][l]);
          expect(desc).toBe(koTraitDesc[id][l]);
          break;
        case 'zh':
          expect(name).toBe(zhTrait[id][l]);
          expect(desc).toBe(zhTraitDesc[id][l]);
          break;
        case 'ru':
          expect(name).toBe(enTrait[id]['en']);
          expect(desc).toBe(enTrait[id].description['en']);
          break;
        default:
          expect(name).toBe(enTrait[id][l]);
          expect(desc).toBe(enTrait[id].description[l]);
      }
    }
  }));

  it('should get 118n trait names', inject([LocalizedLazyDataService], async (service: LocalizedLazyDataService) => {
    const runBasicTest = makeBasicTestRunner(service.getTraitName.bind(service), 'traits');
    for (const id of [33, 34, 35, 36]) {
      await runBasicTest(id);
    }
  }));

  it('should get i18n quests', inject([LocalizedLazyDataService], async (service: LocalizedLazyDataService) => {
    const id = 65537;
    const koQuest = await loadExt('koQuests');
    const zhQuest = await loadExt('zhQuests');
    const enQuest = await loadStd('quests');
    const quest = await service.getQuest(id).toPromise();
    const name = await forkJoin(quest.name).toPromise();
    expect(quest.icon).toBe(enQuest[id].icon);
    for (const l of languages) {
      expect(name[l]).toBeTruthy();
      switch (l) {
        case 'ko':
          expect(name[l]).toBe(koQuest[id][l]);
          break;
        case 'zh':
          expect(name[l]).toBe(zhQuest[id][l]);
          break;
        default:
          expect(name[l]).toBe(enQuest[id].name[l]);
      }
    }
  }));

  it('should get i18n quest names', inject([LocalizedLazyDataService], async (service: LocalizedLazyDataService) => {
    const accessor: JsonAccessor = (data, id, l) => {
      switch (l) {
        case 'ko':
        case 'zh':
          return data[id][l];
        default:
          return data[id]?.name?.[l];
      }
    };
    const runBasicTest = makeBasicTestRunner(service.getQuestName.bind(service), 'quests', accessor);
    for (const id of [65537, 65539, 65540, 65541]) {
      await runBasicTest(id);
    }
  }));

  it('should get i18n tribe', inject([LocalizedLazyDataService], async (service: LocalizedLazyDataService) => {
    const accessor: JsonAccessor = (data, id, l) => {
      switch (l) {
        case 'ko':
        case 'zh':
          return data[id][l];
        default:
          return data[id]?.[`Name_${l}`];
      }
    };
    const runBasicTest = makeBasicTestRunner(service.getTribeName.bind(service), 'tribes', accessor);
    for (const id of [1, 2, 3, 4]) {
      await runBasicTest(id);
    }
  }));

  it('should get i18n base param names', inject([LocalizedLazyDataService], async (service: LocalizedLazyDataService) => {
    const accessor: JsonAccessor = (data, id, l) => {
      switch (l) {
        case 'ko':
        case 'zh':
          return data[id][l];
        default:
          return data[id]?.[`Name_${l}`];
      }
    };
    const runBasicTest = makeBasicTestRunner(service.getBaseParamName.bind(service), 'baseParams', accessor);
    for (const id of [1, 2, 3, 4]) {
      await runBasicTest(id);
    }
  }));

  it('should get 118n job categories', inject([LocalizedLazyDataService], async (service: LocalizedLazyDataService) => {
    const runBasicTest = makeBasicTestRunner(service.getJobCategory.bind(service), 'jobCategories');
    for (const id of [2, 3, 4, 5]) {
      await runBasicTest(id, ['fr', 'en', 'de', 'ja']);
    }
  }));

  it('should get 118n job names', inject([LocalizedLazyDataService], async (service: LocalizedLazyDataService) => {
    const runBasicTest = makeBasicTestRunner(service.getJobName.bind(service), 'jobName');
    for (const id of [2, 3, 4, 5]) {
      await runBasicTest(id);
    }
  }));

  it('should get 118n job abbrs', inject([LocalizedLazyDataService], async (service: LocalizedLazyDataService) => {
    const runBasicTest = makeBasicTestRunner(service.getJobAbbr.bind(service), 'jobAbbr');
    for (const id of [2, 3, 4, 5]) {
      await runBasicTest(id);
    }
  }));

  it('should get 118n leves', inject([LocalizedLazyDataService], async (service: LocalizedLazyDataService) => {
    const runBasicTest = makeBasicTestRunner(service.getLeve.bind(service), 'leves');
    for (const id of [316, 317, 318, 319]) {
      await runBasicTest(id);
    }
  }));

  it('should get 118n npc names', inject([LocalizedLazyDataService], async (service: LocalizedLazyDataService) => {
    const runBasicTest = makeBasicTestRunner(service.getNpcName.bind(service), 'npcs');
    for (const id of [1023229, 1023230, 1023231, 1023232]) {
      await runBasicTest(id);
    }
  }));

  it('should get 118n mob names', inject([LocalizedLazyDataService], async (service: LocalizedLazyDataService) => {
    const runBasicTest = makeBasicTestRunner(service.getMob.bind(service), 'mobs');
    for (const id of [6, 7, 8, 9]) {
      await runBasicTest(id);
    }
  }));

  it('should get 118n notebook division names', inject([LocalizedLazyDataService], async (service: LocalizedLazyDataService) => {
    const accessor: JsonAccessor = (data, id, l) => {
      switch (l) {
        case 'ko':
        case 'zh':
          return data[id][l];
        default:
          return data[id]?.name?.[l];
      }
    };
    const runBasicTest = makeBasicTestRunner(service.getNotebookDivisionName.bind(service), 'notebookDivision', accessor);
    for (const id of [6, 7, 8, 9]) {
      await runBasicTest(id);
    }
  }));

  it('should get 118n notebook division category names', inject([LocalizedLazyDataService], async (service: LocalizedLazyDataService) => {
    const accessor: JsonAccessor = (data, id, l) => {
      switch (l) {
        case 'ko':
        case 'zh':
          return data[id][l];
        default:
          return data[id]?.name?.[l];
      }
    };
    const runBasicTest = makeBasicTestRunner(service.getNotebookDivisionCategoryName.bind(service), 'notebookDivisionCategory', accessor);
    for (const id of [1, 2, 3, 4]) {
      await runBasicTest(id);
    }
  }));

  it('should get 118n triple triad rules', inject([LocalizedLazyDataService], async (service: LocalizedLazyDataService) => {
    const runBasicTest = makeBasicTestRunner(service.getTTRule.bind(service), 'tripleTriadRules');
    for (const id of [1, 2, 3, 4]) {
      await runBasicTest(id);
    }
  }));
});
