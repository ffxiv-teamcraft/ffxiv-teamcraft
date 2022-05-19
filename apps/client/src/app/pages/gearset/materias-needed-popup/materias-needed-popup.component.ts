import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MateriaService } from '../../../modules/gearsets/materia.service';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { GearsetProgression } from '../../../model/gearset/gearset-progression';
import { combineLatest, Observable } from 'rxjs';
import { observeInput } from '../../../core/rxjs/observe-input';
import { switchMap } from 'rxjs/operators';
import { SettingsService } from '../../../modules/settings/settings.service';

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

  constructor(private materiaService: MateriaService, public settings: SettingsService) {
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
  }

}
