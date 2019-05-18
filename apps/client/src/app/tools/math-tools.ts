export class MathTools {

  // Precision is 10^6 because we don't need an exact precision, else issues like 1.0000000000000000009 iems might occur,
  // which results in a ceiled value of 2
  private static PRECISION = 1000000;

  /**
   * Rounds a number to the nearest absolute integer.
   * Rounding 0.3 will return 1 while rounding -0.3 will return -1, not 0 like Math.ceil would.
   * @param {number} n
   * @returns {number}
   */
  public static absoluteCeil(n: number): number {
    return n >= 0 ? Math.ceil(n) : Math.floor(n);
  }

  public static absoluteFloor(n: number): number {
    return n >= 0 ? Math.floor(n) : Math.ceil(n);
  }

  public static round(n: number): number {
    const rounded = Math.round(n * MathTools.PRECISION) / MathTools.PRECISION;
    // We have to handle /3 fraction by ourselves, this check is here for that
    if (Math.abs(rounded % 1) === 0.999999 || Math.abs(rounded % 1) === 0.000001) {
      return Math.round(rounded);
    }
    return rounded;
  }
}
