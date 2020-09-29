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
    mainHand: { ...noProgression },
    offHand: { ...noProgression },
    head: { ...noProgression },
    chest: { ...noProgression },
    gloves: { ...noProgression },
    belt: { ...noProgression },
    legs: { ...noProgression },
    feet: { ...noProgression },
    necklace: { ...noProgression },
    earRings: { ...noProgression },
    bracelet: { ...noProgression },
    ring1: { ...noProgression },
    ring2: { ...noProgression },
    crystal: { ...noProgression }
  };
}
