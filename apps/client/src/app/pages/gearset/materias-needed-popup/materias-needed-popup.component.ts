import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MateriaService } from '../../../modules/gearsets/materia.service';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';

@Component({
  selector: 'app-materias-needed-popup',
  templateUrl: './materias-needed-popup.component.html',
  styleUrls: ['./materias-needed-popup.component.less']
})
export class MateriasNeededPopupComponent implements OnInit {

  @Input()
  gearset: TeamcraftGearset;

  @Input()
  includeAllTools = false;

  @Output()
  includeAllToolsChange = new EventEmitter<boolean>();

  totalNeeded: { id: number, amount: number }[] = [];

  constructor(private materiaService: MateriaService) {
  }

  computeRequirements(): void {
    localStorage.setItem('gearsets:include-all-tools', this.includeAllTools.toString());
    this.totalNeeded = this.materiaService.getTotalNeededMaterias(this.gearset, this.includeAllTools);
  }

  ngOnInit(): void {
    this.computeRequirements();
  }

}
