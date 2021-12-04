export class StaticData {
  public static dohdolMeldingRates = {
    hq: [
      // Sockets
      //2, 3,  4,  5    // Tier
      [90, 48, 28, 16], // I
      [82, 44, 26, 16], // II
      [70, 38, 22, 14], // III
      [58, 32, 20, 12], // IV
      [17, 10, 7, 5], // V
      [17, 0, 0, 0], // VI
      [17, 10, 7, 5], // VII
      [17, 0, 0, 0], // VIII
      [17, 10, 7, 5], // IX
      [17, 0, 0, 0] // X
    ],
    nq: [
      // Sockets
      //2, 3,  4,  5    // Tier
      [80, 40, 20, 10], // I
      [72, 36, 18, 10], // II
      [60, 30, 16, 8], // III
      [48, 24, 12, 6], // IV
      [12, 6, 3, 2], // V
      [12, 0, 0, 0], // VI
      [12, 6, 3, 2], // VII
      [12, 0, 0, 0], // VIII
      [12, 6, 3, 2], // IX
      [12, 0, 0, 0] // X
    ]
  };

  // List of GatheringPointBase ids that cannot spawn anymore due to various conditions
  public static ignoredNodes = [653, 654, 655, 656, 657, 658, 659, 660, 661, 662, 663, 664, 665, 666, 667, 668, 669, 670, 671, 672, 673, 674, 675, 676, 677, 678, 679, 680];
}
