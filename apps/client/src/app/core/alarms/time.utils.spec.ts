import { TimeUtils } from './time.utils';

describe('TimeUtils', () => {

  it('Should find proper intersection for ranges on the same day', () => {
    expect(TimeUtils.getIntersection([12, 14], [8, 16])).toEqual([12, 14]);
    expect(TimeUtils.getIntersection([0, 2], [0, 8])).toEqual([0, 2]);
    expect(TimeUtils.getIntersection([0, 8], [6, 16])).toEqual([6, 8]);
  });

  it('Should return null when no intersections are found', () => {
    expect(TimeUtils.getIntersection([12, 14], [16, 18])).toBeNull();
    expect(TimeUtils.getIntersection([12, 14], [14, 16])).toBeNull();
    expect(TimeUtils.getIntersection([12, 14], [8, 12])).toBeNull();
    expect(TimeUtils.getIntersection([10, 15], [16, 0])).toBeNull();
    expect(TimeUtils.getIntersection([17, 0], [0, 16])).toBeNull();
  });

  it('Should return intersection for complex intervals', () => {
    expect(TimeUtils.getIntersection([22, 4], [0, 8])).toEqual([0, 4]);
    expect(TimeUtils.getIntersection([22, 0], [16, 0])).toEqual([22, 0]);
    expect(TimeUtils.getIntersection([22, 4], [16, 0])).toEqual([22, 0]);
    expect(TimeUtils.getIntersection([22, 4], [16, 8])).toEqual([22, 4]);
    expect(TimeUtils.getIntersection([18, 2], [16, 8])).toEqual([18, 2]);
    expect(TimeUtils.getIntersection([16, 20], [16, 0])).toEqual([16, 20]);
    expect(TimeUtils.getIntersection([22, 4], [1, 16])).toEqual([1, 4]);
    expect(TimeUtils.getIntersection([22, 2], [16, 16])).toEqual([22, 2]);
    expect(TimeUtils.getIntersection([16, 16], [22, 2])).toEqual([22, 2]);
  });

  it('Should detect if an hour is in a given interval', () => {
    expect(TimeUtils.isInInterval([0, 8], 7)).toBeTruthy();
    expect(TimeUtils.isInInterval([0, 8], 15)).toBeFalsy();
    expect(TimeUtils.isInInterval([15, 23], 15)).toBeTruthy();
    expect(TimeUtils.isInInterval([16, 8], 21)).toBeTruthy();
    expect(TimeUtils.isInInterval([16, 8], 5)).toBeTruthy();
    expect(TimeUtils.isInInterval([22, 0], 22)).toBeTruthy();
  });

  it('Should compute interval duration properly', () => {
    expect(TimeUtils.getDuration([1, 4])).toBe(3);
    expect(TimeUtils.getDuration([4, 1])).toBe(21);
  });
});
