import { Component } from '@angular/core';
import { Language } from '../../../core/data/language';
import { I18nName } from '../../../model/common/i18n-name';
import { zhActions } from '../../../core/data/sources/zh-actions';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { LazyData } from '../../../lazy-data/lazy-data';
import { I18nElement } from '../../../lazy-data/lazy-data-types';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';

@Component({
  selector: 'app-macro-translator',
  templateUrl: './macro-translator.component.html',
  styleUrls: ['./macro-translator.component.less']
})
export class MacroTranslatorComponent {
  macroToTranslate: string;

  macroLanguage: 'en' | 'fr' | 'de' | 'ja' | 'ko' | 'zh';

  macroTranslatedTabs: { label: string, content: string[] }[];

  invalidInputs: boolean;

  translationDone: boolean;

  languages = [
    { id: 'fr', name: 'FR' },
    { id: 'en', name: 'EN' },
    { id: 'de', name: 'DE' },
    { id: 'ja', name: 'JA' },
    { id: 'ko', name: 'KO' },
    { id: 'zh', name: 'ZH' }
  ];

  private findActionsRegex: RegExp =
    new RegExp(/\/(ac|action|aaction|gaction|generalaction|statusoff)[\s]+((\w|[éàèç]|[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|\u203B)+|["”“][^"”“]+["”“])?.*/, 'i');


  private findActionsAutoTranslatedRegex: RegExp =
    new RegExp(/\/(ac|action|aaction|gaction|generalaction|statusoff)[\s]+([^<]+)?.*/, 'i');

  constructor(private lazyData: LazyDataFacade) {
  }

  translateMacro(): void {
    const macroTranslated: { [index: string]: string[] } = {
      fr: [],
      en: [],
      de: [],
      ja: [],
      ko: [],
      zh: []
    };

    this.translationDone = false;
    this.invalidInputs = false;

    safeCombineLatest(this.macroToTranslate.split('\n').map(line => {
      let match = this.findActionsRegex.exec(line);
      if (match !== null && match !== undefined) {
        const skillName = match[2].replace(/["”“]/g, '');
        // Get translated skill
        return this.getCraftingActionByName(skillName, this.macroLanguage).pipe(
          switchMap(translatedSkill => {
            if (translatedSkill) {
              return of({
                original: line,
                skillName: skillName,
                translated: translatedSkill,
                replace: (name) => {
                  if (line.indexOf('"') === -1) {
                    return `"${name}"`;
                  }
                  return name;
                }
              });
            } else if (skillName === 'clear') {
              return of({
                original: line
              });
            } else {
              match = this.findActionsAutoTranslatedRegex.exec(line);
              if (match !== null) {
                return this.getCraftingActionByName(match[2], this.macroLanguage).pipe(
                  map(autoTranslateSkill => {
                    return {
                      original: match[2],
                      translated: autoTranslateSkill,
                      replace: (name) => `"${name}" `
                    };
                  })
                );
              }
              this.invalidInputs = true;
              return of(null);
            }
          })
        );
      } else {
        // Push the line without translation
        return of({
          original: line
        });
      }
    })).pipe(
      map(lines => {
        lines
          .filter(line => !!line)
          .forEach(line => {
            Object.keys(macroTranslated)
              .forEach(key => {
                const row = macroTranslated[key];
                if (line.skillName) {
                  row.push(line.original.replace(line.skillName, line.replace(line.translated[key])));
                } else {
                  row.push(line.original);
                }
              });
          });
      })
    ).subscribe(() => {
      if (!this.invalidInputs) {
        this.macroTranslatedTabs = Object.keys(macroTranslated).map((key) => {
          return { label: key.toUpperCase(), content: macroTranslated[key] };
        });
      }
      this.translationDone = true;
    });
  }

  public getCraftingActionByName(name: string, language: Language): Observable<I18nName> {
    return combineLatest([
      this.lazyData.getI18nEntry('actions', true),
      this.lazyData.getI18nEntry('craftActions', true)
    ]).pipe(
      map(([actions, craftActions]) => {
        if (language === 'zh') {
          const zhRow = zhActions.find((a) => a.zh === name);
          if (zhRow !== undefined) {
            name = zhRow.en;
            language = 'en';
          }
        }
        let resultIndex = this.getIndexByName(craftActions, name, language, true);
        if (resultIndex === -1) {
          resultIndex = this.getIndexByName(actions, name, language, true);
        }
        if (name === 'Scrutiny' && language === 'en') {
          resultIndex = 22185;
        }
        const result: I18nName = craftActions[resultIndex] || actions[resultIndex];
        if (resultIndex === -1) {
          throw new Error(`Data row not found for crafting action ${name}`);
        }
        const zhResultRow = zhActions.find((a) => a.en === result.en);
        if (zhResultRow !== undefined) {
          result.zh = zhResultRow.zh;
        }
        return result;
      })
    );
  }

  public getIndexByName(array: I18nElement, name: string, language: string, flip = false): number {
    if (array === undefined) {
      return -1;
    }
    if (['en', 'fr', 'de', 'ja', 'ko', 'zh'].indexOf(language) === -1) {
      language = 'en';
    }
    let res = -1;
    let keys = Object.keys(array);
    if (flip) {
      keys = keys.reverse();
    }
    const cleanupRegexp = /[^a-z\s,.]/;
    for (const key of keys) {
      if (!array[key]) {
        continue;
      }
      if (array[key].name && array[key].name[language].toString().toLowerCase().replace(cleanupRegexp, '-') === name.toLowerCase().replace(cleanupRegexp, '-')) {
        res = +key;
        break;
      }
      if (array[key][language] && array[key][language].toString().toLowerCase().replace(cleanupRegexp, '-') === name.toLowerCase().replace(cleanupRegexp, '-')) {
        res = +key;
        break;
      }
    }
    if (['ko', 'zh'].indexOf(language) > -1 && res === -1) {
      return this.getIndexByName(array, name, 'en');
    }
    return res;
  }

}
