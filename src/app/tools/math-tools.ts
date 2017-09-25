export class MathTools {

    /**
     * Rounds a number to the nearest absolute integer.
     * Rounding 0.3 will return 1 while rounding -0.3 will return -1, not 0 like Math.ceil would.
     * @param {number} n
     * @returns {number}
     */
    public static round(n: number): number {
        return n >= 0 ? Math.ceil(n) : Math.floor(n);
    }
}
