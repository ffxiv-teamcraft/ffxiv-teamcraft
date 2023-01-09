export interface LazyFood {
  ID:         number;
  LevelEquip: number;
  LevelItem:  number;
  Bonuses:    Bonuses;
}

export interface Bonuses {
  SkillSpeed?:              Cp;
  Vitality?:                Cp;
  DirectHitRate?:           Cp;
  CriticalHit?:             Cp;
  Tenacity?:                Cp;
  Determination?:           Cp;
  SpellSpeed?:              Cp;
  Control?:                 Cp;
  GP?:                      Cp;
  Gathering?:               Cp;
  Perception?:              Cp;
  CP?:                      Cp;
  Craftsmanship?:           Cp;
  Piety?:                   Cp;
  SlowResistance?:          BindResistance;
  SilenceResistance?:       BindResistance;
  BlindResistance?:         BindResistance;
  PoisonResistance?:        BindResistance;
  StunResistance?:          BindResistance;
  SleepResistance?:         BindResistance;
  BindResistance?:          BindResistance;
  HeavyResistance?:         BindResistance;
  DesynthesisSkillGain?:    BindResistance;
  ReducedDurabilityLoss?:   BindResistance;
  IncreasedSpiritbondGain?: BindResistance;
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
  Max?:     number;
  MaxHQ?:   number;
}
