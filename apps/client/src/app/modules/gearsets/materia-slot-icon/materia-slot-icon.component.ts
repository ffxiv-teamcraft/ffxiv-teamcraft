import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { EquipmentPiece } from '../../../model/gearset/equipment-piece';
import { MateriaService } from '../materia.service';

@Component({
  selector: 'app-materia-slot-icon',
  templateUrl: './materia-slot-icon.component.html',
  styleUrls: ['./materia-slot-icon.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MateriaSlotIconComponent implements OnInit {

  @Input()
  equipmentPiece: EquipmentPiece;

  @Input()
  index: number;

  meldingChances = 0;

  constructor(private materiaService: MateriaService) {
  }

  getSlotType(): string {
    if (this.equipmentPiece.materiaSlots > this.index) {
      return 'normal';
    }
    return 'overmeld';
  }

  getMateriaGrade(): string {
    const materia = this.materiaService.getMateria(this.equipmentPiece.materias[this.index]);
    const grade = materia.tier - 1;
    return `${grade < 10 ? '0' : ''}${grade}`;
  }

  ngOnInit(): void {
    this.meldingChances = this.materiaService.getMeldingChances(this.equipmentPiece, this.equipmentPiece.materias[this.index], this.index);
  }

}
