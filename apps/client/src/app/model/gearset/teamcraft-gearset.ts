import { EquipmentPiece } from './equipment-piece';
import { DataWithPermissions } from '../../core/database/permissions/data-with-permissions';

export class TeamcraftGearset extends DataWithPermissions {
  name: string;

  /**
   * True when it has been imported via the automated gearset sync process
   */
  fromSync = false;
  job: number;

  index = -1;

  mainHand: EquipmentPiece;
  offHand: EquipmentPiece;

  head: EquipmentPiece;
  chest: EquipmentPiece;
  gloves: EquipmentPiece;
  belt?: EquipmentPiece;
  legs: EquipmentPiece;
  feet: EquipmentPiece;

  necklace: EquipmentPiece;
  earRings: EquipmentPiece;
  bracelet: EquipmentPiece;
  ring1: EquipmentPiece;
  ring2: EquipmentPiece;

  crystal: EquipmentPiece;

  // See foods.json
  food: any;

  isCombatSet(): boolean {
    return this.job < 8 || this.job > 18;
  }
}
