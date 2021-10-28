export interface LazyEquipment {
  equipSlotCategory: number;
  level:             number;
  unique:            number;
  jobs:              Job[];
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
  ID = "ID",
  Lnc = "LNC",
  Ltw = "LTW",
  Mch = "MCH",
  Min = "MIN",
  Mnk = "MNK",
  Mrd = "MRD",
  Nin = "NIN",
  PLD = "PLD",
  Pgl = "PGL",
  RDM = "RDM",
  Rog = "ROG",
  Sam = "SAM",
  Sch = "SCH",
  Smn = "SMN",
  Thm = "THM",
  War = "WAR",
  Whm = "WHM",
  Wvr = "WVR",
}
