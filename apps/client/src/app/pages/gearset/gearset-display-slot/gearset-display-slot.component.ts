import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { EquipmentPiece } from '../../../model/gearset/equipment-piece';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { GearsetProgression } from '../../../model/gearset/gearset-progression';

@Component({
  selector: 'app-gearset-display-slot',
  templateUrl: './gearset-display-slot.component.html',
  styleUrls: ['./gearset-display-slot.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
