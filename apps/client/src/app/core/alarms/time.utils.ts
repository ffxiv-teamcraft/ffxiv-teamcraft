export type Interval = [number, number];

export class TimeUtils {
  static isInInterval(interval: Interval, time: number): boolean {
    if (interval[1] > interval[0] || interval[1] === 0) {
      return time >= interval[0] && time <= (interval[1] || 24);
    } else {
      const [day1, day2] = this.splitInterval(interval);
      return this.isInInterval(day1, time) || this.isInInterval(day2, time);
    }
  }

  static getIntersection(a: Interval, b: Interval): Interval | null {
    if (a[0] === a[1]) {
      return b;
    }
    if (b[0] === b[1]) {
      return a;
    }
    if (a[1] < a[0] || b[1] < b[0]) {
      return this.getComplexIntersection(a, b);
    }
    return this.getSimpleIntersection(a, b);
  }

  static getComplexIntersection(a: Interval, b: Interval): Interval | null {
    const [a1, a2] = this.splitInterval(a);
    const [b1, b2] = this.splitInterval(b);
    if (a[0] === a[1]) {
      return b;
    }
    if (b[0] === b[1]) {
      return a;
    }
    const firstDay = this.getSimpleIntersection(a1, b1);
    const secondDay = this.getSimpleIntersection(a2, b2);
    const possibleSecondDay = this.getSimpleIntersection(a2, b1);
    if (!firstDay && !secondDay) {
      if (possibleSecondDay) {
        return possibleSecondDay;
      }
      return null;
    }
    if (firstDay && !secondDay) {
      return [firstDay[0], firstDay[1] % 24];
    }
    if (secondDay && !firstDay) {
      return [secondDay[0], secondDay[1] % 24];
    }
    return [(firstDay || [0, 0])[0], (secondDay || [0, 0])[1]];
  }

  static splitInterval(interval: Interval): [Interval, Interval] {
    if (interval[1] < interval[0] || interval[0] === 0) {
      const firstDay = this.getSimpleIntersection([0, 24], [interval[0] || 24, interval[1] + 24]) || [0, 0];
      const secondDay = this.getSimpleIntersection([interval[0] || 24, interval[1] + 24], [24, 48]) || [0, 0];
      return [firstDay, [secondDay[0] % 24, secondDay[1] % 24]];
    }
    if (interval[0] === interval[1]) {
      return [[interval[0], 0], [0, interval[1]]];
    }
    return [[...interval], [0, 0]];
  }

  static getSimpleIntersection(a: Interval, b: Interval): Interval | null {
    const min = a[0] < b[0] ? a : b;
    const max = min === a ? b : a;
    if (min[1] <= max[0]) {
      return null;
    }
    const result: Interval = [max[0], (min[1] < max[1] ? min[1] : max[1])];
    if (result[0] === result[1]) {
      return null;
    }
    return result;
  }

  static getDuration(i: Interval): number {
    if (i[1] < i[0]) {
      return this.getDuration([i[0], 24]) + this.getDuration([0, i[1]]);
    }
    return i[1] - i[0];
  }

  static isSameDay(a: Date, b: Date): boolean {
    return Math.floor(a.getTime() / 86400000) === Math.floor(b.getTime() / 86400000);
  }
}
