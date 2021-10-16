import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MateriaService } from '../../../modules/gearsets/materia.service';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { GearsetProgression } from '../../../model/gearset/gearset-progression';

@Component({
  selector: 'app-materias-needed-popup',
  templateUrl: './materias-needed-popup.component.html',
  styleUrls: ['./materias-needed-popup.component.less']
})
export class MateriasNeededPopupComponent implements OnInit {

  @Input()
  gearset: TeamcraftGearset;

  private _progression: GearsetProgression;

  @Input()
  set progression(p: GearsetProgression) {
    this._progression = p;
    this.computeRequirements();
  }

  get progression(): GearsetProgression {
    return this._progression;
  }

  @Input()
  includeAllTools = false;

  @Output()
  includeAllToolsChange = new EventEmitter<boolean>();

  totalNeeded: { id: number, amount: number, scrip?: { id: number, amount: number } }[] = [];

  constructor(private materiaService: MateriaService) {
  }

  computeRequirements(): void {
    localStorage.setItem('gearsets:include-all-tools', this.includeAllTools.toString());
    this.totalNeeded = this.materiaService.getTotalNeededMaterias(this.gearset, this.includeAllTools, this.progression);
  }

  ngOnInit(): void {
    this.computeRequirements();
  }

}
