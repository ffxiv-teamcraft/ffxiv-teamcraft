import { Vector2 } from '@ffxiv-teamcraft/types';

export const animalsSpawnData: Record<number, Vector2 & { weather?: number, spawn?: number, duration?: number }> = {
  1: {
    x: 20,
    y: 23
  },
  2: {
    x: 20,
    y: 23,
    weather: 2
  },
  3: {
    x: 20,
    y: 26
  },
  4: {
    x: 20,
    y: 26,
    spawn: 6,
    duration: 3
  },
  5: {
    x: 19,
    y: 11
  },
  6: {
    x: 19,
    y: 11,
    spawn: 12,
    duration: 3
  },
  7: {
    x: 15,
    y: 19
  },
  8: {
    x: 15,
    y: 19,
    spawn: 9,
    duration: 3
  },
  9: {
    x: 20,
    y: 13
  },
  10: {
    x: 27,
    y: 19,
    weather: 4
  },
  11: {
    x: 16,
    y: 12
  },
  12: {
    x: 16,
    y: 12,
    spawn: 15,
    duration: 3
  },
  13: {
    x: 21,
    y: 19
  },
  14: {
    x: 20,
    y: 19,
    spawn: 18,
    duration: 3
  },
  15: {
    x: 20,
    y: 21
  },
  16: {
    x: 13,
    y: 11,
    weather: 1
  },
  17: {
    x: 30,
    y: 11
  },
  18: {
    x: 31,
    y: 11,
    spawn: 0,
    duration: 3
  },
  19: {
    x: 12,
    y: 17
  },
  20: {
    x: 12,
    y: 17,
    weather: 3
  },
  21: {
    x: 26,
    y: 24
  },
  22: {
    x: 26,
    y: 22,
    spawn: 3,
    duration: 3
  },
  23: {
    x: 28,
    y: 28
  },
  24: {
    x: 31,
    y: 28,
    weather: 7
  },
  25: {
    x: 22.1,
    y: 20.8,
    spawn: 18,
    duration: 3,
    weather: 4
  },
  26: {
    x: 17.8,
    y: 12.6,
    spawn: 0,
    duration: 3,
    weather: 7
  },
  27: {
    x: 25,
    y: 28,
    spawn: 12,
    duration: 3,
    weather: 2
  },
  28: {
    x: 17,
    y: 24,
    spawn: 6,
    duration: 3,
    weather: 8
  },
  29: {
    x: 33,
    y: 16,
    spawn: 9,
    duration: 3,
    weather: 3
  },
  30: {
    x: 14,
    y: 22,
    spawn: 15,
    duration: 3,
    weather: 1
  },
  31: {
    x: 15,
    y: 14,
    spawn: 18,
    duration: 3,
    weather: 2
  },
  32: {
    x: 19,
    y: 19,
    spawn: 3,
    duration: 3,
    weather: 3
  }
};
