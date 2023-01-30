export interface LazyFood {
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
  CriticalHit?:             Cp;
  DesynthesisSkillGain?:    BindResistance;
  Determination?:           Cp;
  DirectHitRate?:           Cp;
  GP?:                      Cp;
  Gathering?:               Cp;
  HeavyResistance?:         BindResistance;
  IncreasedSpiritbondGain?: BindResistance;
  Perception?:              Cp;
  Piety?:                   Cp;
  PoisonResistance?:        BindResistance;
  ReducedDurabilityLoss?:   BindResistance;
  SilenceResistance?:       BindResistance;
  SkillSpeed?:              Cp;
  SleepResistance?:         BindResistance;
  SlowResistance?:          BindResistance;
  SpellSpeed?:              Cp;
  StunResistance?:          BindResistance;
  Tenacity?:                Cp;
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
  Max?:     number;
  MaxHQ?:   number;
  Relative: boolean;
  Value:    number;
  ValueHQ:  number;
}
