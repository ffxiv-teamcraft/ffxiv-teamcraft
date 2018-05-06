import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {CraftingAction} from '../../model/actions/crafting-action';
import {LocalizedDataService} from '../../../../core/data/localized-data.service';
import {ActionType} from '../../model/actions/action-type';
import {I18nToolsService} from '../../../../core/tools/i18n-tools.service';

@Component({
    selector: 'app-macro-popup',
    templateUrl: './macro-popup.component.html',
    styleUrls: ['./macro-popup.component.scss']
})
export class MacroPopupComponent implements OnInit {

    public macro: string[][] = [[]];

    private readonly maxMacroLines = 15;

    constructor(@Inject(MAT_DIALOG_DATA) private rotation: CraftingAction[], private l12n: LocalizedDataService,
                private i18n: I18nToolsService) {
    }

    ngOnInit() {
        this.rotation.forEach((action, index) => {
            let macroFragment = this.macro[this.macro.length - 1];
            // One macro is 15 lines, if this one is full, create another one.
            if (macroFragment.length >= this.maxMacroLines) {
                this.macro.push([]);
                macroFragment = this.macro[this.macro.length - 1];
            }
            let actionName = this.i18n.getName(this.l12n.getCraftingAction(action.getIds()[0]));
            if (actionName.indexOf(' ') > -1) {
                actionName = `"${actionName}"`;
            }
            macroFragment.push(`/ac ${actionName} <wait.${action.getType() === ActionType.BUFF ? 2 : 3}>`);
        });
    }

}
