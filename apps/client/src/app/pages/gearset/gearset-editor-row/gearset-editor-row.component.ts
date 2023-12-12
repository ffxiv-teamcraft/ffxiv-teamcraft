import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { EquipmentPiece } from '../../../model/gearset/equipment-piece';
import { XivapiL12nPipe } from '../../../pipes/pipes/xivapi-l12n.pipe';
import { IfMobilePipe } from '../../../pipes/pipes/if-mobile.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { StatPipe } from '../../../modules/gearsets/stat.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { MateriaSlotIconComponent } from '../../../modules/gearsets/materia-slot-icon/materia-slot-icon.component';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzGridModule } from 'ng-zorro-antd/grid';

@Component({
    selector: 'app-gearset-editor-row',
    templateUrl: './gearset-editor-row.component.html',
    styleUrls: ['./gearset-editor-row.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzGridModule, FlexModule, NzCheckboxModule, ItemIconComponent, NzSwitchModule, FormsModule, NgFor, MateriaSlotIconComponent, NzToolTipModule, NgIf, AsyncPipe, TranslateModule, I18nPipe, StatPipe, ItemNamePipe, IfMobilePipe, XivapiL12nPipe]
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
