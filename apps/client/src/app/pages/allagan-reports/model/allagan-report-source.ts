export enum AllaganReportSource {
  FISHING = 'FISHING',
  SPEARFISHING = 'SPEARFISHING',
  DESYNTH = 'DESYNTH',
  REDUCTION = 'REDUCTION',
  GARDENING = 'GARDENING',
  LOOT = 'LOOT', // Obtained by using a given item (timeworn maps, sacks, chests, etc)

  VENTURE = 'VENTURE', // Retainer venture
  VOYAGE = 'VOYAGE', // Airship/Submarine voyage
  DROP = 'DROP', // Drop from monsters kill
  ISLAND_ANIMAL = 'ISLAND_ANIMAL', // Drop from island animals
  INSTANCE = 'INSTANCE', // Obtained inside an instance
  FATE = 'FATE', // Obtained as fate reward
  MOGSTATION = 'MOGSTATION',

  DEPRECATED = 'DEPRECATED' // Cannot be obtained anymore
}
