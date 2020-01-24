import { Component, Input, OnInit } from '@angular/core';
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

  totalNeeded: { id: number, amount: number }[] = [];

  constructor(private materiaService: MateriaService) {
  }

  ngOnInit(): void {
    this.totalNeeded = this.materiaService.getTotalNeededMaterias(this.gearset);
  }

}
