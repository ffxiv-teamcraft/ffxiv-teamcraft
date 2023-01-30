export interface LazyMedicine {
  Bonuses:    Bonuses;
  ID:         number;
  LevelEquip: number;
  LevelItem:  number;
}

export interface Bonuses {
  BindResistance?:          BindResistance;
  BlindResistance?:         BindResistance;
  CP?:                      Cp;
  Control?:                 Cp;
  Craftsmanship?:           Cp;
  DesynthesisSkillGain?:    BindResistance;
  Dexterity?:               Cp;
  HeavyResistance?:         BindResistance;
  IncreasedSpiritbondGain?: BindResistance;
  Intelligence?:            Cp;
  Mind?:                    Cp;
  PoisonResistance?:        BindResistance;
  SilenceResistance?:       BindResistance;
  SleepResistance?:         BindResistance;
  SlowResistance?:          BindResistance;
  Strength?:                Cp;
  StunResistance?:          BindResistance;
  Vitality?:                Cp;
}

export interface BindResistance {
  ID:       number;
  Relative: boolean;
  Value:    number;
  ValueHQ:  number;
}

export interface Cp {
  ID:       number;
  Max:      number;
  MaxHQ:    number;
  Relative: boolean;
  Value:    number;
  ValueHQ:  number;
}
