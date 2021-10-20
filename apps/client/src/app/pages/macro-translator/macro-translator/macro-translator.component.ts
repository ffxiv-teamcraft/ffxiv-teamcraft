import { Component } from '@angular/core';
import { LocalizedDataService } from '../../../core/data/localized-data.service';

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

  constructor(private localizedDataService: LocalizedDataService) {
  }

  translateMacro() {
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
    for (let line of this.macroToTranslate.split('\n')) {
      let match = this.findActionsRegex.exec(line);
      if (match !== null && match !== undefined) {
        const skillName = match[2].replace(/["”“]/g, '');
        // Get translated skill
        try {
          const translatedSkill = this.localizedDataService.getCraftingActionByName(skillName, this.macroLanguage);
          // Push translated line to each language
          Object.keys(macroTranslated).forEach(key => {
            if (translatedSkill[key] !== undefined) {
              // Get rid of smart quotes
              line = line.replace(/[”“]/g, '"');
              if (((key === 'ko' || key === 'zh') && line.indexOf('"') === -1) || (translatedSkill[key].indexOf(' ') > -1 && line.indexOf('"') === -1)) {
                macroTranslated[key].push(line.replace(skillName, `"${translatedSkill[key]}"`));
              } else {
                macroTranslated[key].push(line.replace(skillName, translatedSkill[key]));
              }
            }
          });
        } catch (ignored) {
          if (skillName === 'clear') {
            Object.keys(macroTranslated).forEach(key => {
              macroTranslated[key].push(line);
            });
            continue;
          }
          // Ugly implementation but it's a specific case we don't want to refactor for.
          try {
            // If there's no skill match with the first regex, try the second one (for auto translated skills)
            match = this.findActionsAutoTranslatedRegex.exec(line);
            if (match !== null) {
              const translatedSkill = this.localizedDataService.getCraftingActionByName(match[2], this.macroLanguage);
              // Push translated line to each language
              Object.keys(macroTranslated).forEach(key => {
                macroTranslated[key].push(line.replace(match[2], `"${translatedSkill[key]}" `));
              });
            }
          } catch (ignoredAgain) {
            // console.log(ignored);
            // console.log(ignoredAgain);
            this.invalidInputs = true;
            break;
          }
        }
      } else {
        // Push the line without translation
        Object.keys(macroTranslated).map(key => macroTranslated[key]).forEach(row => row.push(line));
      }
    }

    if (!this.invalidInputs) {
      this.macroTranslatedTabs = Object.keys(macroTranslated).map((key) => {
        return { label: key.toUpperCase(), content: macroTranslated[key] };
      });
    }

    this.translationDone = true;
  }

}
