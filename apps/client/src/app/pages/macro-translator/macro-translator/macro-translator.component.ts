import { Component } from '@angular/core';
import { Language } from '../../../core/data/language';
import { I18nName } from '@ffxiv-teamcraft/types';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateModule } from '@ngx-translate/core';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';

import { FormsModule } from '@angular/forms';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-macro-translator',
    templateUrl: './macro-translator.component.html',
    styleUrls: ['./macro-translator.component.less'],
    standalone: true,
    imports: [FlexModule, NzRadioModule, FormsModule, NzInputModule, NzButtonModule, NzWaveModule, NzTabsModule, NzAlertModule, TranslateModule]
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

  private findActionsRegex =
    new RegExp(/\/(ac|action|aaction|gaction|generalaction|statusoff)[\s]+((\w|[éàèç]|[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|[\u3041-\u3096]|[\u2E80-\u2FD5]|\u203B)+|["”“][^"”“]+["”“])?.*/, 'i');


  private findActionsAutoTranslatedRegex =
    new RegExp(/\/(ac|action|aaction|gaction|generalaction|statusoff)[\s]+([^<]+)?.*/, 'i');

  constructor(private lazyData: LazyDataFacade, private i18n: I18nToolsService) {
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
      map((lines: Partial<{ original: string, translated: string, replace: (input: string) => string, skillName: string }>[]) => {
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
        let resultIndex = this.i18n.getIndexByName(craftActions, name, language, true);
        if (resultIndex === -1) {
          resultIndex = this.i18n.getIndexByName(actions, name, language, true);
        }
        if (name === 'Scrutiny' && language === 'en') {
          resultIndex = 22185;
        }
        if (name === 'Cast' && language === 'en') {
          resultIndex = 289;
        }
        const result: I18nName = craftActions[resultIndex] || actions[resultIndex];
        if (resultIndex === -1) {
          throw new Error(`Data row not found for crafting action ${name}`);
        }
        return result;
      })
    );
  }
}
