export type WorkshopPattern = [[number, number], [number, number], [number, number], [number, number], [number, number], [number, number], [number, number]];

// https://docs.google.com/spreadsheets/d/1R4UKA2zZ1MZ7sRUEBAi2Eh0NCVPbb1iQh8BjoQ_vVX4/htmlview?usp=sharing&pru=AAABg18c8ZU*BNHx2yqGE1bBAxE2UPgOUw#

// [ Supply, Demand ]
export const workshopPatterns: WorkshopPattern[] = [
  [[1, -1], [1, 1], [2, 4], [2, 2], [2, 2], [2, 2], [2, 2]], // Cycle 2 weak
  [[1, -2], [0, 0], [2, 4], [2, 2], [2, 2], [2, 2], [2, 2]], // Cycle 2 Strong

  [[2, -1], [1, 1], [1, 1], [2, 4], [2, 2], [2, 2], [2, 2]], // Cycle 3 weak
  [[2, -1], [1, 0], [0, 0], [2, 4], [2, 2], [2, 2], [2, 2]], // Cycle 3 Strong

  [[2, -1], [2, 2], [1, 1], [1, 1], [2, 4], [2, 2], [2, 2]], // Cycle 4 weak
  [[2, -1], [2, 2], [1, 0], [0, 0], [2, 4], [2, 2], [2, 2]], // Cycle 4 Strong

  [[2, -1], [2, 2], [2, 2], [1, 1], [1, 1], [2, 4], [2, 2]], // Cycle 5 weak
  [[2, -1], [2, 2], [2, 2], [1, 0], [0, 0], [2, 4], [2, 2]], // Cycle 5 Strong

  [[2, -1], [1, 1], [2, 3], [2, 1], [1, 1], [1, 1], [2, 4]], // Cycle 6 weak
  [[2, -1], [1, 1], [2, 4], [2, 0], [1, 0], [0, 0], [2, 4]], // Cycle 6 Strong

  [[2, -1], [1, 1], [2, 4], [2, 1], [2, 1], [1, 1], [1, 1]], // Cycle 7 weak
  [[2, -1], [1, 1], [2, 4], [2, 2], [2, 0], [1, 0], [0, 0]], // Cycle 7 Strong
];
