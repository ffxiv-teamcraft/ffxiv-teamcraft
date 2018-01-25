import {Component, OnInit} from '@angular/core';
import {LocalizedDataService} from '../../../core/data/localized-data.service';

@Component({
    selector: 'app-macro-translation',
    templateUrl: './macro-translation.component.html',
    styleUrls: ['./macro-translation.component.scss']
})
export class MacroTranslationComponent implements OnInit {
    macroToTranslate: string;
    macroLanguage: 'en' | 'fr' | 'de' | 'ja';
    macroTranslatedTabs: { label: string, content: string[] }[];

    invalidInputs: boolean;
    translationDone: boolean;

    languages = [
        {id: 'fr', name: 'FR'},
        {id: 'en', name: 'EN'},
        {id: 'de', name: 'DE'},
        {id: 'ja', name: 'JA'}
    ];

    private findActionsRegex: RegExp =
        new RegExp(/\/(?=ac|action|aaction|gaction|generalaction)[\s]+(([\w]+)|"([^"]+)")?.*/, 'i');

    constructor(private localizedDataService: LocalizedDataService) {
    }

    ngOnInit() {
    }

    translateMacro() {
        const macroTranslated: { [index: string]: string[] } = {
            fr: [],
            en: [],
            de: [],
            ja: [],
        };

        let match;
        this.translationDone = false;
        this.invalidInputs = false;
        for (const line of this.macroToTranslate.split('\n')) {
            if ((match = this.findActionsRegex.exec(line)) !== null) {
                // Get translated skill
                try {
                    const translatedSkill = this.localizedDataService.getCraftingActionByName(match[3], this.macroLanguage);

                    // Push translated line to each language
                    Object.keys(macroTranslated).forEach(key => {
                        macroTranslated[key].push(line.replace(match[3], translatedSkill[key]));
                    });
                } catch (ignored) {
                    this.invalidInputs = true;
                    break;
                }
            } else {
                // Push the line without translation
                Object.keys(macroTranslated).map(key => macroTranslated[key]).forEach(row => row.push(line));
            }
        }

        if (!this.invalidInputs) {
            this.macroTranslatedTabs = Object.keys(macroTranslated).map((key) => {
                return {label: key.toUpperCase(), content: macroTranslated[key]}
            })
        }

        this.translationDone = true;
    }
}
