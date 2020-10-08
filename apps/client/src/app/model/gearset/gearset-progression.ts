import { EquipmentPieceProgression } from './equipment-piece-progression';

export interface GearsetProgression {
  mainHand: EquipmentPieceProgression;
  offHand: EquipmentPieceProgression;

  head: EquipmentPieceProgression;
  chest: EquipmentPieceProgression;
  gloves: EquipmentPieceProgression;
  belt: EquipmentPieceProgression;
  legs: EquipmentPieceProgression;
  feet: EquipmentPieceProgression;

  necklace: EquipmentPieceProgression;
  earRings: EquipmentPieceProgression;
  bracelet: EquipmentPieceProgression;
  ring1: EquipmentPieceProgression;
  ring2: EquipmentPieceProgression;

  crystal: EquipmentPieceProgression;
}

export function newEmptyProgression(): GearsetProgression {
  const noProgression = {
    item: false,
    materias: [false, false, false, false, false]
  };

  return {
    mainHand: JSON.parse(JSON.stringify(noProgression)),
    offHand: JSON.parse(JSON.stringify(noProgression)),
    head: JSON.parse(JSON.stringify(noProgression)),
    chest: JSON.parse(JSON.stringify(noProgression)),
    gloves: JSON.parse(JSON.stringify(noProgression)),
    belt: JSON.parse(JSON.stringify(noProgression)),
    legs: JSON.parse(JSON.stringify(noProgression)),
    feet: JSON.parse(JSON.stringify(noProgression)),
    necklace: JSON.parse(JSON.stringify(noProgression)),
    earRings: JSON.parse(JSON.stringify(noProgression)),
    bracelet: JSON.parse(JSON.stringify(noProgression)),
    ring1: JSON.parse(JSON.stringify(noProgression)),
    ring2: JSON.parse(JSON.stringify(noProgression)),
    crystal: JSON.parse(JSON.stringify(noProgression))
  };
}
