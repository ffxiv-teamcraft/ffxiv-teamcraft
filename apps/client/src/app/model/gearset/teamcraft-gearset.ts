import { EquipmentPiece } from './equipment-piece';
import { DataWithPermissions } from '../../core/database/permissions/data-with-permissions';

export class TeamcraftGearset extends DataWithPermissions {
  name: string;

  job: number;

  mainHand: EquipmentPiece;
  offHand: EquipmentPiece;

  head: EquipmentPiece;
  chest: EquipmentPiece;
  gloves: EquipmentPiece;
  belt: EquipmentPiece;
  legs: EquipmentPiece;
  feet: EquipmentPiece;

  necklace: EquipmentPiece;
  earRings: EquipmentPiece;
  bracelet: EquipmentPiece;
  ring1: EquipmentPiece;
  ring2: EquipmentPiece;

  crystal: EquipmentPiece;
}
