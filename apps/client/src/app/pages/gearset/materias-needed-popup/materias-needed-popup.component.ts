import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MateriaService } from '../../../modules/gearsets/materia.service';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { GearsetProgression } from '../../../model/gearset/gearset-progression';
import { combineLatest, Observable } from 'rxjs';
import { observeInput } from '../../../core/rxjs/observe-input';
import { filter, map, switchMap } from 'rxjs/operators';
import { SettingsService } from '../../../modules/settings/settings.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-materias-needed-popup',
  templateUrl: './materias-needed-popup.component.html',
  styleUrls: ['./materias-needed-popup.component.less']
})
export class MateriasNeededPopupComponent {

  @Input()
  gearset: TeamcraftGearset;

  @Input()
  progression: GearsetProgression;

  @Input()
  includeAllTools = false;

  @Output()
  includeAllToolsChange = new EventEmitter<boolean>();

  totalNeeded$: Observable<{ id: number, amount: number, scrip?: { id: number, amount: number } }[]>;

  totalPerCurrency$: Observable<{ id: number, amount: number }[]>;

  constructor(private materiaService: MateriaService, public settings: SettingsService, public translate: TranslateService) {
    this.totalNeeded$ = combineLatest([
      observeInput(this, 'gearset'),
      observeInput(this, 'progression', true),
      observeInput(this, 'includeAllTools', true)
    ]).pipe(
      switchMap(([gearset, progression, includeAllTools]) => {
        if (includeAllTools !== null) {
          localStorage.setItem('gearsets:include-all-tools', includeAllTools.toString());
        }
        return this.materiaService.getTotalNeededMaterias(gearset, includeAllTools || false, progression);
      })
    );

    this.totalPerCurrency$ = this.totalNeeded$.pipe(
      map(total => {
        return total.reduce((acc, row) => {
          if (!row.scrip) {
            return acc;
          }
          let currencyRow = acc.find(r => r.id === row.scrip.id);
          if (!currencyRow) {
            acc.push({ id: row.scrip.id, amount: 0 });
            currencyRow = acc[acc.length - 1];
          }
          currencyRow.amount += row.amount * row.scrip.amount;
          return acc;
        }, []);
      })
    );
  }

}
