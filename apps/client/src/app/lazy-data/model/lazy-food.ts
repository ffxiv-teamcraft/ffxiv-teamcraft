export interface LazyFood {
  Bonuses:    Bonuses;
  ID:         number;
  LevelEquip: number;
  LevelItem:  number;
}

export interface Bonuses {
  DirectHitRate?:           Cp;
  SkillSpeed?:              Cp;
  Vitality?:                Cp;
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
  Max?:     number;
  MaxHQ?:   number;
  Relative: boolean;
  Value:    number;
  ValueHQ:  number;
}
