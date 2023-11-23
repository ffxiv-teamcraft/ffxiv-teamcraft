import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { EquipmentPiece } from '../../../model/gearset/equipment-piece';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { GearsetProgression } from '../../../model/gearset/gearset-progression';
import { MateriaBonusPipe } from '../../../pipes/pipes/materia-bonus.pipe';
import { IlvlPipe } from '../../../pipes/pipes/ilvl.pipe';
import { IfMobilePipe } from '../../../pipes/pipes/if-mobile.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { MateriaSlotIconComponent } from '../../../modules/gearsets/materia-slot-icon/materia-slot-icon.component';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ItemCapsTableComponent } from '../../../modules/gearsets/item-caps-table/item-caps-table.component';
import { ItemNameClipboardDirective } from '../../../core/item-name-clipboard.directive';
import { FormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-gearset-display-slot',
    templateUrl: './gearset-display-slot.component.html',
    styleUrls: ['./gearset-display-slot.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, NgIf, ItemIconComponent, NzToolTipModule, NzCheckboxModule, FormsModule, ItemNameClipboardDirective, ItemCapsTableComponent, NzButtonModule, NzIconModule, NzPopoverModule, NgFor, MateriaSlotIconComponent, I18nNameComponent, AsyncPipe, TranslateModule, I18nPipe, I18nRowPipe, ItemNamePipe, IfMobilePipe, IlvlPipe, MateriaBonusPipe]
})
export class GearsetDisplaySlotComponent {

  @Input()
  gearset: TeamcraftGearset;

  @Input()
  progression: GearsetProgression;

  @Output()
  progressionChange: EventEmitter<GearsetProgression> = new EventEmitter<GearsetProgression>();

  @Input()
  propertyName: keyof TeamcraftGearset;

  @Input()
  verbose = false;

  get equipmentPiece(): EquipmentPiece {
    return this.gearset[this.propertyName] as EquipmentPiece;
  }

  get emptySlotIconUnicode(): string {
    switch (this.propertyName) {
      case 'mainHand':
        return '&#xF081;';
      case 'offHand':
        return '&#xF082;';
      case 'head':
        return '&#xF083;';
      case 'chest':
        return '&#xF084;';
      case 'gloves':
        return '&#xF085;';
      case 'belt':
        return '&#xF086;';
      case 'legs':
        return '&#xF087;';
      case 'feet':
        return '&#xF088;';
      case 'necklace':
        return '&#xF090;';
      case 'earRings':
        return '&#xF089;';
      case 'bracelet':
        return '&#xF091;';
      case 'ring1':
      case 'ring2':
        return '&#xF092;';
      case 'crystal':
        return '&#xF093;';
    }
  }

}
