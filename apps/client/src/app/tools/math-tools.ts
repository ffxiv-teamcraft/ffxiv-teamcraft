export class MathTools {

  // Precision is 10^6 because we don't need an exact precision, else issues like 1.0000000000000000009 iems might occur,
  // which results in a ceiled value of 2
  private static PRECISION = 1000000;

  public static absoluteCeil(n: number, precision = 0): number {
    const precisionEffect = Math.pow(10, precision);
    const res = n >= 0 ? Math.ceil(n * precisionEffect) : Math.floor(n * precisionEffect);
    return res / precisionEffect;
  }

  public static absoluteFloor(n: number, precision = 0): number {
    const precisionEffect = Math.pow(10, precision);
    const res = n >= 0 ? Math.floor(n * precisionEffect) : Math.ceil(n * precisionEffect);
    return res / precisionEffect;
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
