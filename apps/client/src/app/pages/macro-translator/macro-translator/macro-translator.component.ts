import { Component } from '@angular/core';
import { LocalizedDataService } from '../../../core/data/localized-data.service';

@Component({
  selector: 'app-macro-translator',
  templateUrl: './macro-translator.component.html',
  styleUrls: ['./macro-translator.component.less']
})
export class MacroTranslatorComponent {
  macroToTranslate: string;
  macroLanguage: 'en' | 'fr' | 'de' | 'ja' | 'ko';
  macroTranslatedTabs: { label: string, content: string[] }[];

  invalidInputs: boolean;
  translationDone: boolean;

  languages = [
    { id: 'fr', name: 'FR' },
    { id: 'en', name: 'EN' },
    { id: 'de', name: 'DE' },
    { id: 'ja', name: 'JA' },
    { id: 'ko', name: 'KO' }
  ];

  private findActionsRegex: RegExp =
    new RegExp(/\/(ac|action|aaction|gaction|generalaction)[\s]+(([\w]+)|"([^"]+)")?.*/, 'i');

  private findActionsAutoTranslatedRegex: RegExp =
    new RegExp(/\/(ac|action|aaction|gaction|generalaction)[\s]+([^<]+)?.*/, 'i');

  constructor(private localizedDataService: LocalizedDataService) {
  }

  translateMacro() {
    const macroTranslated: { [index: string]: string[] } = {
      fr: [],
      en: [],
      de: [],
      ja: [],
      ko: []
    };

    this.translationDone = false;
    this.invalidInputs = false;
    for (const line of this.macroToTranslate.split('\n')) {
      let match = this.findActionsRegex.exec(line);
      if (match !== null && match !== undefined) {
        const skillName = match[2].replace(/"/g, '');
        // Get translated skill
        try {
          const translatedSkill = this.localizedDataService.getCraftingActionByName(skillName, this.macroLanguage);

          // Push translated line to each language
          Object.keys(macroTranslated).forEach(key => {
            if (key === 'ko' && line.indexOf('"') === -1) {
              macroTranslated[key].push(line.replace(skillName, `"${translatedSkill[key]}"`));
            } else {
              macroTranslated[key].push(line.replace(skillName, translatedSkill[key]));
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
