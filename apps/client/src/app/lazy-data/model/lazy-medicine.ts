export interface LazyMedicine {
  ID:         number;
  LevelEquip: number;
  LevelItem:  number;
  Bonuses:    Bonuses;
}

export interface Bonuses {
  Strength?:                Cp;
  Dexterity?:               Cp;
  Vitality?:                Cp;
  Intelligence?:            Cp;
  Mind?:                    Cp;
  SlowResistance?:          BindResistance;
  SilenceResistance?:       BindResistance;
  BlindResistance?:         BindResistance;
  PoisonResistance?:        BindResistance;
  StunResistance?:          BindResistance;
  SleepResistance?:         BindResistance;
  BindResistance?:          BindResistance;
  HeavyResistance?:         BindResistance;
  IncreasedSpiritbondGain?: BindResistance;
  DesynthesisSkillGain?:    BindResistance;
  Craftsmanship?:           Cp;
  Control?:                 Cp;
  CP?:                      Cp;
}

export interface BindResistance {
  ID:       number;
  Relative: boolean;
  Value:    number;
  ValueHQ:  number;
}

export interface Cp {
  ID:       number;
  Relative: boolean;
  Value:    number;
  ValueHQ:  number;
  Max:      number;
  MaxHQ:    number;
}
