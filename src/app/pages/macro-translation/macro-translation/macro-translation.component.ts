import {Component, OnInit} from '@angular/core';
import {LocalizedDataService} from '../../../core/data/localized-data.service';

@Component({
    selector: 'app-macro-translation',
    templateUrl: './macro-translation.component.html',
    styleUrls: ['./macro-translation.component.scss']
})
export class MacroTranslationComponent implements OnInit {
    macroToTranslate;
    macroLanguage;

    languages = [
        {id: 'fr', name: 'FR'},
        {id: 'en', name: 'EN'},
        {id: 'de', name: 'DE'},
        {id: 'ja', name: 'JA'}
    ];

    constructor(private localizedDataService: LocalizedDataService) {
    }

    ngOnInit() {
        this.localizedDataService
    }

    translateMacro() {
        const findActionsRegex = new RegExp(/\/ac[\s]+(([\w]+)|"([^"]+)")?.*/, 'igm');

        let match;
        while ((match = findActionsRegex.exec(this.macroToTranslate)) !== null) {
            console.log(this.localizedDataService.getCraftingActionByName(match[3], this.macroLanguage));
        }

        // console.log(this.localizedDataService.getCraftingActionByName(action, this.macroLanguage));
    }
}
