export class Tables {

  public static readonly HQ_TABLE = [
    1, 1, 1, 1, 1, 2, 2, 2, 2, 3,
    3, 3, 3, 4, 4, 4, 4, 5, 5, 5,
    5, 6, 6, 6, 6, 7, 7, 7, 7, 8,
    8, 8, 9, 9, 9, 10, 10, 10, 11, 11,
    11, 12, 12, 12, 13, 13, 13, 14, 14, 14,
    15, 15, 15, 16, 16, 17, 17, 17, 18, 18,
    18, 19, 19, 20, 20, 21, 22, 23, 24, 26,
    28, 31, 34, 38, 42, 47, 52, 58, 64, 68,
    71, 74, 76, 78, 80, 81, 82, 83, 84, 85,
    86, 87, 88, 89, 90, 91, 92, 94, 96, 98, 100];

  // source: https://github.com/Ermad/ffxiv-craft-opt-web/blob/master/app/js/ffxivcraftmodel.js#L1942
  public static readonly NYMEIAS_WHEEL_TABLE = {
    1: 30,
    2: 30,
    3: 30,
    4: 20,
    5: 20,
    6: 20,
    7: 10,
    8: 10,
    9: 10,
    10: 10,
    11: 10
  };

  // source: https://github.com/Ermad/ffxiv-craft-opt-web/blob/master/app/js/ffxivcraftmodel.js#L1823
  public static readonly LEVEL_TABLE = {
    51: 120, // 120
    52: 125, // 125
    53: 130, // 130
    54: 133, // 133
    55: 136, // 136
    56: 139, // 139
    57: 142, // 142
    58: 145, // 145
    59: 148, // 148
    60: 150, // 150
    61: 260,
    62: 265,
    63: 270,
    64: 273,
    65: 276,
    66: 279,
    67: 282,
    68: 285,
    69: 288,
    70: 290,
    71: 385,
    72: 395,
    73: 400,
    74: 403,
    75: 406,
    76: 409,
    77: 412,
    78: 415,
    79: 418,
    80: 420
  };

  // source: https://github.com/Ermad/ffxiv-craft-opt-web/blob/master/app/js/ffxivcraftmodel.js#L1956
  // 80 1-3 star is 430/450/480, not sure if 4-star will be 510 or 520
  public static readonly PROGRESS_PENALTY_TABLE = {
    180: -0.02,
    210: -0.035,
    220: -0.035,
    250: -0.04,
    320: -0.02,
    350: -0.035,
    380: -0.05
  };

  // source: https://github.com/Ermad/ffxiv-craft-opt-web/blob/master/app/js/ffxivcraftmodel.js#L1846
  public static readonly INGENUITY_RLVL_TABLE = {
    40: 36,
    41: 36,
    42: 37,
    43: 38,
    44: 39,
    45: 40,
    46: 41,
    47: 42,
    48: 43,
    49: 44,
    50: 45,
    55: 50,     // 50_1star     *** unverified
    70: 51,     // 50_2star     *** unverified
    90: 58,     // 50_3star     *** unverified
    110: 59,    // 50_4star     *** unverified
    115: 100,   // 51 @ 169/339 difficulty
    120: 101,   // 51 @ 210/410 difficulty
    125: 102,   // 52
    130: 110,   // 53
    133: 111,   // 54
    136: 112,   // 55
    139: 126,   // 56
    142: 131,   // 57
    145: 134,   // 58
    148: 137,   // 59
    150: 140,   // 60
    160: 151,   // 60_1star
    180: 152,   // 60_2star
    210: 153,   // 60_3star
    220: 153,   // 60_3star
    250: 154,   // 60_4star
    255: 238,   // 61 @ 558/1116 difficulty
    260: 240,   // 61 @ 700/1400 difficulty
    265: 242,   // 62
    270: 250,   // 63
    273: 251,   // 64
    276: 252,   // 65
    279: 266,   // 66
    282: 271,   // 67
    285: 274,   // 68
    288: 277,   // 69
    290: 280,   // 70
    300: 291,   // 70_1star
    320: 292,   // 70_2star
    350: 293,   // 70_3star
    380: 294   // 70_4star theory
  };

  // source: https://github.com/Ermad/ffxiv-craft-opt-web/blob/master/app/js/ffxivcraftmodel.js#L1894
  public static readonly INGENUITY_II_RLVL_TABLE = {
    40: 33,
    41: 34,
    42: 35,
    43: 36,
    44: 37,
    45: 38,
    46: 39,
    47: 40,
    48: 40,
    49: 41,
    50: 42,
    55: 47,     // 50_1star     *** unverified
    70: 48,     // 50_2star     *** unverified
    90: 56,     // 50_3star     *** unverified
    110: 57,    // 50_4star     *** unverified
    115: 97,    // 51 @ 169/339 difficulty
    120: 99,    // 51 @ 210/410 difficulty
    125: 101,   // 52
    130: 109,   // 53
    133: 110,   // 54
    136: 111,   // 55
    139: 125,   // 56
    142: 130,   // 57
    145: 133,   // 58
    148: 136,   // 59
    150: 139,   // 60
    160: 150,   // 60_1star
    180: 151,   // 60_2star
    210: 152,   // 60_3star
    220: 152,   // 60_3star
    250: 153,   // 60_4star
    255: 237,   // 61 @ 558/1116 difficulty
    260: 239,   // 61 @ 700/1400 difficulty
    265: 241,   // 62
    270: 249,   // 63
    273: 250,   // 64
    276: 251,   // 65
    279: 265,   // 66
    282: 270,   // 67
    285: 273,   // 68
    288: 276,   // 69
    290: 279,   // 70
    300: 290,   // 70_1star
    320: 291,   // 70_2star
    350: 292,   // 70_3star
    380: 293   // 70_4star theory
  };

  // source: https://github.com/Ermad/ffxiv-craft-opt-web/blob/master/app/js/ffxivcraftmodel.js#L1965
  public static QUALITY_PENALTY_TABLE = {
    0: -0.02,
    90: -0.03,
    160: -0.05,
    180: -0.06,
    200: -0.07,
    245: -0.08,
    300: -0.09,
    310: -0.10,
    340: -0.11,
    370: -0.12
  };
}
