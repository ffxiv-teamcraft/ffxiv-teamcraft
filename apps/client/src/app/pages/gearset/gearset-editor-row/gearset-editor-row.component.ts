import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { EquipmentPiece } from '../../../model/gearset/equipment-piece';

@Component({
  selector: 'app-gearset-editor-row',
  templateUrl: './gearset-editor-row.component.html',
  styleUrls: ['./gearset-editor-row.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GearsetEditorRowComponent {

  @Input()
  gearset: TeamcraftGearset;

  @Input()
  property: string;

  @Input()
  item: any;

  @Input()
  equipmentPiece: EquipmentPiece;

  @Input()
  stats: { id: number, value: number }[];

  @Output()
  pieceChange = new EventEmitter<boolean>();

  @Output()
  editMaterias = new EventEmitter<void>();

  constructor() {
  }

  setGearsetPiece(checked: boolean): void {
    this.pieceChange.emit(checked);
  }

  triggerEditMaterias(): void {
    this.editMaterias.emit();
  }

}
