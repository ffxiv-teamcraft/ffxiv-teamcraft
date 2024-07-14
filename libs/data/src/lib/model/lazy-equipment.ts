export interface LazyEquipment {
  delay:             number;
  equipSlotCategory: number;
  jobs:              Job[];
  level:             number;
  mDef:              number;
  mDmg:              number;
  pDef:              number;
  pDmg:              number;
  unique:            number;
}

export enum Job {
  AST = "AST",
  Acn = "ACN",
  Adv = "ADV",
  Alc = "ALC",
  Arc = "ARC",
  Arm = "ARM",
  Blm = "BLM",
  Blu = "BLU",
  Brd = "BRD",
  Bsm = "BSM",
  Btn = "BTN",
  Cnj = "CNJ",
  Crp = "CRP",
  Cul = "CUL",
  Dnc = "DNC",
  Drg = "DRG",
  Drk = "DRK",
  Fsh = "FSH",
  GSM = "GSM",
  Gla = "GLA",
  Gnb = "GNB",
  Lnc = "LNC",
  Ltw = "LTW",
  Mch = "MCH",
  Min = "MIN",
  Mnk = "MNK",
  Mrd = "MRD",
  Nin = "NIN",
  PLD = "PLD",
  Pct = "PCT",
  Pgl = "PGL",
  RDM = "RDM",
  Rog = "ROG",
  Rpr = "RPR",
  Sam = "SAM",
  Sch = "SCH",
  Sge = "SGE",
  Smn = "SMN",
  Thm = "THM",
  Vpr = "VPR",
  War = "WAR",
  Whm = "WHM",
  Wvr = "WVR",
}
