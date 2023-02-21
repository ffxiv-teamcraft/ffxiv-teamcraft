import { WorkshopPattern, workshopPatterns } from '../workshop-patterns';

export function findPatterns(itemHistory: number[][]): { index: number, pattern: WorkshopPattern, day: number, strong: boolean }[] {
  let matches = workshopPatterns.map((pattern, i) => ({ pattern, i }));
  for (let index = 0; index < itemHistory.length; index++) {
    if (matches.length === 1) {
      break;
    }
    matches = matches.filter(({ pattern, i }) => {
      const patternEntry = pattern[index];
      const day = itemHistory[index];
      return Math.min(day[0], 2) === patternEntry[0]
        && (
          patternEntry[1] === -1
          || (patternEntry[1] === -2 && day[1] !== 1)
          || day[1] === patternEntry[1]
        );
    });
  }
  return matches.map(({ pattern, i }) => {
    return { day: (3 + Math.floor(i / 2)) % 7, index: 1 + Math.floor(i / 2), pattern, strong: i % 2 === 1 };
  });
}
