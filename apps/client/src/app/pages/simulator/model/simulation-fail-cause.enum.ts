export enum SimulationFailCause {
  // Only used for safe mode, this is for when safe mode is enabled and action success rate is <100 at this moment.
  UNSAFE_ACTION,
  DURABILITY_REACHED_ZERO,
  NOT_ENOUGH_CP,
  MISSING_LEVEL_REQUIREMENT,
  NOT_SPECIALIST,
  NO_INNER_QUIET
}
