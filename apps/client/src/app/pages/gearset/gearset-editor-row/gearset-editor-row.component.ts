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
  materias: number[];

  @Input()
  property: string;

  @Input()
  item: any;

  @Input()
  equipmentPiece: EquipmentPiece;

  @Input()
  canEquip: boolean;

  @Input()
  stats: { id: number, value: number }[];

  @Output()
  pieceChange = new EventEmitter<boolean>();

  @Output()
  editMaterias = new EventEmitter<void>();

  public get statColsSize(): number {
    return this.stats.length > 3 ? 2 : 4;
  }

  public get nameColSize(): number {
    return 24 - this.stats.length * (this.statColsSize);
  }

  setGearsetPiece(checked: boolean): void {
    this.pieceChange.emit(checked);
  }

  updateHq(toggle: boolean): void {
    this.equipmentPiece = {
      ...this.equipmentPiece,
      hq: toggle
    };
    if (this.isPieceSelected()) {
      this.setGearsetPiece(true);
    }
  }

  triggerEditMaterias(): void {
    this.editMaterias.emit();
  }

  isPieceSelected(): boolean {
    return this.gearset[this.property] && this.gearset[this.property].itemId === this.item.ID;
  }

  trackByStat(index: number, stat: { id: number, value: number }): number {
    return stat.id;
  }

}
