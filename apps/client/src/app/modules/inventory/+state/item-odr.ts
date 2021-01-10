export interface OdrCoords {
  container: number;
  slot: number;
}

export interface ItemOdr {
  Player: OdrCoords[];
  ArmoryMain: OdrCoords[];
  ArmoryHead: OdrCoords[];
  ArmoryBody: OdrCoords[];
  ArmoryHand: OdrCoords[];
  ArmoryWaist: OdrCoords[];
  ArmoryLegs: OdrCoords[];
  ArmoryFeet: OdrCoords[];
  ArmoryOff: OdrCoords[];
  ArmoryEar: OdrCoords[];
  ArmoryNeck: OdrCoords[];
  ArmoryWrist: OdrCoords[];
  ArmoryRing: OdrCoords[];
  ArmorySoulCrystal: OdrCoords[];
  SaddleBag: OdrCoords[];
  PremiumSaddlebag: OdrCoords[];
  Retainers: {
    id: string,
    inventory: OdrCoords[]
  }[];
}
