export type Interval = [number, number];

export class TimeUtils {
  static getIntersection(a: Interval, b: Interval): Interval | null {
    if (a[1] < a[0] || b[1] < b[0]) {
      return this.getComplexIntersection(a, b);
    }
    return this.getSimpleIntersection(a, b);
  }

  static getComplexIntersection(a: Interval, b: Interval): Interval | null {
    const [a1, a2] = this.splitInterval(a);
    const [b1, b2] = this.splitInterval(b);
    const firstDay = this.getSimpleIntersection(a1, b1);
    const secondDay = this.getSimpleIntersection(a2, b2);
    if (!firstDay && !secondDay) {
      return null;
    }
    return [(firstDay || [0, 0])[0], (secondDay || [0, 0])[1]];
  }

  static splitInterval(interval: Interval): [Interval, Interval] {
    if (interval[1] < interval[0] || interval[0] === 0) {
      const firstDay = this.getSimpleIntersection([0, 24], [interval[0] || 24, interval[1] + 24]) || [0, 0];
      const secondDay = this.getSimpleIntersection([interval[0] || 24, interval[1] + 24], [24, 48]) || [0, 0];
      return [firstDay, [secondDay[0] % 24, secondDay[1] % 24]];
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
}
