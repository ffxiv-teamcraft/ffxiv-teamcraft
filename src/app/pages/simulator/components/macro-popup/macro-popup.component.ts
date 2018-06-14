import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {CraftingAction} from '../../model/actions/crafting-action';
import {LocalizedDataService} from '../../../../core/data/localized-data.service';
import {I18nToolsService} from '../../../../core/tools/i18n-tools.service';
import {CraftingJob} from '../../model/crafting-job.enum';

@Component({
    selector: 'app-macro-popup',
    templateUrl: './macro-popup.component.html',
    styleUrls: ['./macro-popup.component.scss']
})
export class MacroPopupComponent implements OnInit {

    public macro: string[][] = [[]];

    public aactionsMacro: string[] = [];

    private readonly maxMacroLines = 15;

    public addEcho = true;

    public echoSeNumber = 1;

    public fixedEcho = false;

    constructor(@Inject(MAT_DIALOG_DATA) private data: { rotation: CraftingAction[], job: CraftingJob }, private l12n: LocalizedDataService,
                private i18n: I18nToolsService) {
    }

    public generateMacros(): void {
        this.macro = [[]];
        this.aactionsMacro = ['/aaction clear'];
        this.data.rotation.forEach((action) => {
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
            if (action.getLevelRequirement().job !== CraftingJob.ANY && action.getLevelRequirement().job !== this.data.job) {
                if (this.aactionsMacro.indexOf(`/aaction ${actionName}`) === -1) {
                    this.aactionsMacro.push(`/aaction ${actionName}`);
                }
            }
            macroFragment.push(`/ac ${actionName} <wait.${action.getWaitDuration()}>`);
            if (macroFragment.length === 14 && this.addEcho) {
                let seNumber: number;
                if (this.fixedEcho) {
                    seNumber = this.echoSeNumber;
                } else {
                    seNumber = this.echoSeNumber - 1 + this.macro.length;
                }
                macroFragment.push(`/echo Macro #${this.macro.length} finished <se.${seNumber}>`);
            }
        });
        if (this.macro[this.macro.length - 1].length < 15 && this.addEcho) {
            let seNumber: number;
            if (this.fixedEcho) {
                seNumber = this.echoSeNumber;
            } else {
                seNumber = this.echoSeNumber + this.macro.length;
            }
            this.macro[this.macro.length - 1].push(`/echo Craft finished <se.${seNumber}>`)
        }
        if (this.aactionsMacro.length > 0) {
            this.aactionsMacro.push('/echo Cross class setup finished <se.4>');
        }
    }

    getText(macro: string[]): string {
        return macro.join('\n');
    }

    ngOnInit() {
        this.generateMacros();
    }

}
