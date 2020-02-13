import { Component, Input } from '@angular/core';
import { EquipmentPiece } from '../../../model/gearset/equipment-piece';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';

@Component({
  selector: 'app-gearset-display-slot',
  templateUrl: './gearset-display-slot.component.html',
  styleUrls: ['./gearset-display-slot.component.less']
})
export class GearsetDisplaySlotComponent {

  @Input()
  gearset: TeamcraftGearset;

  @Input()
  propertyName: keyof TeamcraftGearset;

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
