import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EquipmentPiece } from '../../../model/gearset/equipment-piece';
import { MateriaService } from '../materia.service';
import { observeInput } from '../../../core/rxjs/observe-input';
import { map, switchMap } from 'rxjs/operators';
import { combineLatest, of } from 'rxjs';

@Component({
  selector: 'app-materia-slot-icon',
  templateUrl: './materia-slot-icon.component.html',
  styleUrls: ['./materia-slot-icon.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MateriaSlotIconComponent {

  @Input()
  equipmentPiece: EquipmentPiece;

  @Input()
  index: number;

  index$ = observeInput(this, 'index');

  equipmentPiece$ = observeInput(this, 'equipmentPiece');

  materiaGrade$ = combineLatest([
    this.index$,
    this.equipmentPiece$
  ]).pipe(
    switchMap(([index, equipmentPiece]) => {
      return this.materiaService.getMateria(equipmentPiece.materias[index]).pipe(
        map(materia => {
          if (!materia) {
            return '0';
          }
          const grade = materia.tier - 1;
          return grade.toString().padStart(2, '0');
        })
      );
    })
  );

  meldingChances$ = combineLatest([
    this.index$,
    this.equipmentPiece$
  ]).pipe(
    switchMap(([index, equipmentPiece]) => {
      if (equipmentPiece.materias[index]) {
        return this.materiaService.getMeldingChances(equipmentPiece, equipmentPiece.materias[index], index);
      }
      return of(0);
    })
  );


  constructor(private materiaService: MateriaService) {
  }

  getSlotType(equipmentPiece: EquipmentPiece, index: number): string {
    if (equipmentPiece.materiaSlots > index) {
      return 'normal';
    }
    return 'overmeld';
  }

}
