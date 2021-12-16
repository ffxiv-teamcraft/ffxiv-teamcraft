export interface LazyLeve {
  en: string;
  ja: string;
  de: string;
  fr: string;
  job: Job;
  lvl: number;
  items: Item[];
}

export interface Item {
  itemId: number;
  amount: number;
}

export interface Job {
  en: En | null;
  ja: Ja | null;
  de: De | null;
  fr: Fr | null;
}

export enum De {
  Alc = 'ALC',
  Fis = 'FIS',
  Ger = 'GER',
  Gld = 'GLD',
  Grm = 'GRM',
  Grs = 'GRS',
  Gär = 'GÄR',
  KriegerMagier = 'Krieger, Magier',
  Min = 'MIN',
  Pla = 'PLA',
  Web = 'WEB',
  Zmr = 'ZMR',
}

export enum En {
  Alc = 'ALC',
  Arm = 'ARM',
  Bsm = 'BSM',
  Btn = 'BTN',
  Crp = 'CRP',
  Cul = 'CUL',
  DisciplesOfWarOrMagic = 'Disciples of War or Magic',
  Fsh = 'FSH',
  GSM = 'GSM',
  Ltw = 'LTW',
  Min = 'MIN',
  Wvr = 'WVR',
}

export enum Fr {
  Alc = 'ALC',
  Arm = 'ARM',
  Bot = 'BOT',
  CombattantsEtMages = 'combattants et mages',
  Cou = 'COU',
  Cui = 'CUI',
  Frg = 'FRG',
  Men = 'MEN',
  Min = 'MIN',
  Orf = 'ORF',
  Pêc = 'PÊC',
  Tan = 'TAN',
}

export enum Ja {
  ファイターソーサラー = 'ファイター ソーサラー',
  園芸師 = '園芸師',
  彫金師 = '彫金師',
  採掘師 = '採掘師',
  木工師 = '木工師',
  漁師 = '漁師',
  甲冑師 = '甲冑師',
  裁縫師 = '裁縫師',
  調理師 = '調理師',
  錬金術師 = '錬金術師',
  鍛冶師 = '鍛冶師',
  革細工師 = '革細工師',
}
