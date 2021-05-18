import { Component, OnInit } from '@angular/core';
import { ByregotsBlessing, CraftingAction, CraftingJob, FinalAppraisal, Simulation } from '@ffxiv-teamcraft/simulator';
import { LocalizedDataService } from '../../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { Consumable } from '../../model/consumable';
import { FreeCompanyAction } from '../../model/free-company-action';
import { SettingsService } from '../../../../modules/settings/settings.service';

@Component({
  selector: 'app-macro-popup',
  templateUrl: './macro-popup.component.html',
  styleUrls: ['./macro-popup.component.less']
})
export class MacroPopupComponent implements OnInit {

  public macro: string[][] = [[]];

  public totalDuration: number;

  public durationPerFragment: number[] = [];

  private readonly maxMacroLines = 15;

  public addEcho = this.settings.macroEcho;

  public echoSeNumber = this.settings.macroEchoSeNumber;

  public fixedEcho = this.settings.macroFixedEcho;

  public extraWait = this.settings.macroExtraWait;

  public macroCompletionMessage = this.settings.macroCompletionMessage;

  public breakBeforeByregotsBlessing = this.settings.macroBreakBeforeByregot;

  public macroLock = this.settings.macroLock;

  public addConsumables = this.settings.macroConsumables;

  public addConsumablesWaitTime = this.settings.addConsumablesWaitTime;

  rotation: CraftingAction[];

  job: CraftingJob;

  simulation: Simulation;

  food: Consumable;
  medicine: Consumable;
  freeCompanyActions: FreeCompanyAction[] = [];

  tooManyAactions = false;

  constructor(private l12n: LocalizedDataService, private i18n: I18nToolsService, private translator: TranslateService, public settings: SettingsService) {
    // TEMP: load settings and clean up localStorage
    if (localStorage.getItem('macros:addecho') !== null) {
      this.addEcho = this.settings.macroEcho = localStorage.getItem('macros:addecho') !== 'false';
      localStorage.removeItem('macros:addecho');
    }

    if (localStorage.getItem('macros:macrolock') !== null) {
      this.macroLock = this.settings.macroLock = localStorage.getItem('macros:macrolock') === 'true';
      localStorage.removeItem('macros:macrolock');
    }

    if (localStorage.getItem('macros:consumables') !== null) {
      this.addConsumables = this.settings.macroConsumables = localStorage.getItem('macros:consumables') === 'true';
      localStorage.removeItem('macros:consumables');
    }
  }

  public generateMacros(): void {
    this.settings.macroExtraWait = this.extraWait;
    this.settings.macroLock = this.macroLock;
    this.settings.macroEcho = this.addEcho;
    this.settings.macroBreakBeforeByregot = this.breakBeforeByregotsBlessing;
    this.settings.macroFixedEcho = this.fixedEcho;
    this.settings.macroEchoSeNumber = this.echoSeNumber;
    this.settings.macroCompletionMessage = this.macroCompletionMessage;

    this.settings.macroConsumables = this.addConsumables;
    this.settings.addConsumablesWaitTime = this.addConsumablesWaitTime;

    this.macro = this.macroLock ? [['/mlock']] : [[]];
    if (this.addConsumables) {
      const notification = this.getConsumablesNotification();
      if (notification) {
        this.macro[0].push(notification);
      }
    }
    this.totalDuration = 0;
    this.durationPerFragment = [];
    let totalLength = 0;
    this.rotation.forEach((action, actionIndex) => {
      let macroFragment = this.macro[this.macro.length - 1];
      // One macro is 15 lines, if this one is full, create another one.
      // Alternatively, if breaking before Byregots Blessing is enabled, split there too.
      if ((this.breakBeforeByregotsBlessing && action.is(ByregotsBlessing)) || macroFragment.length >= this.maxMacroLines) {
        this.macro.push(this.macroLock ? ['/mlock'] : []);
        macroFragment = this.macro[this.macro.length - 1];
      }
      if (action.getIds()[0] === -1) {
        macroFragment.push(`/statusoff "${this.i18n.getName(this.l12n.getAction(new FinalAppraisal().getIds()[0]))}"`);
        totalLength++;
      } else {
        let actionName = this.i18n.getName(this.l12n.getAction(action.getIds()[0]));
        if (actionName.indexOf(' ') > -1 || this.translator.currentLang === 'ko') {
          actionName = `"${actionName}"`;
        }
        macroFragment.push(`/ac ${actionName} <wait.${action.getWaitDuration() + this.extraWait}>`);
        this.totalDuration += action.getWaitDuration() + this.extraWait;
        this.durationPerFragment[this.macro.length - 1] = this.durationPerFragment[this.macro.length - 1] || 0;
        this.durationPerFragment[this.macro.length - 1] += action.getWaitDuration() + this.extraWait;
        totalLength++;
      }

      let doneWithChunk: boolean;
      if (this.breakBeforeByregotsBlessing && actionIndex < this.rotation.length - 1 && this.rotation[actionIndex + 1].is(ByregotsBlessing)) {
        doneWithChunk = true;
      } else if (macroFragment.length === 14 && this.addEcho && this.rotation.length > totalLength + 1) {
        doneWithChunk = true;
      }

      if (this.addEcho && doneWithChunk) {
        let seNumber: number;
        if (this.fixedEcho) {
          seNumber = this.echoSeNumber;
        } else {
          seNumber = Math.min(this.echoSeNumber - 1 + this.macro.length, 16);
        }
        macroFragment.push(`/echo Macro #${this.macro.length} finished <se.${seNumber}>`);
        totalLength++;
      }
    });
    if (this.macro[this.macro.length - 1].length < 15 && this.addEcho) {
      let seNumber: number;
      if (this.fixedEcho) {
        seNumber = this.echoSeNumber;
      } else {
        seNumber = Math.min(this.echoSeNumber + this.macro.length - 1, 16);
      }
      this.macro[this.macro.length - 1].push(`/echo ${this.macroCompletionMessage} <se.${seNumber}>`);
    }
  }

  /**
   * Returns a full macro line, as a string, if one should be added to notify
   * the user of their choice in buffs. This will return `undefined` if either
   * the user has disabled this notification, or if there is no notification to
   * add (no buffs selected).
   */
  private getConsumablesNotification(): string {
    if (!this.addConsumables) {
      return undefined;
    }

    const hqTag = ' ' + this.translator.instant('SIMULATOR.Hq');
    const necessaryBuffs = [];

    if (this.food) {
      let foodBuff = this.i18n.getName(this.l12n.getItem(this.food.itemId));
      if (this.food.hq) {
        foodBuff += hqTag;
      }
      necessaryBuffs.push(foodBuff);
    }

    if (this.medicine) {
      let medicineBuff = this.i18n.getName(this.l12n.getItem(this.medicine.itemId));
      if (this.medicine.hq) {
        medicineBuff += hqTag;
      }
      necessaryBuffs.push(medicineBuff);
    }

    if (this.freeCompanyActions && this.freeCompanyActions.length > 0) {
      this.freeCompanyActions.forEach(action =>
        necessaryBuffs.push(this.i18n.getName(this.l12n.getFreeCompanyAction(action.actionId)))
      );
    }

    if (necessaryBuffs.length > 0) {
      const notification = this.translator.instant('SIMULATOR.Consumable_notification',
        { buffs: necessaryBuffs.join(', ') });
      return `/echo ${notification} <se.5> <wait.${this.addConsumablesWaitTime}>`;
    }
    return undefined;
  }

  getText(macro: string[]): string {
    return macro.join('\n');
  }

  ngOnInit() {
    this.generateMacros();
  }

}
