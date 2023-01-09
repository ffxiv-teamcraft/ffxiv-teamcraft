// Copied from Kobold because we can't use their values due to a zlib dep issue
export enum ColumnDataType {
  STRING = 0x0,
  BOOLEAN = 0x1,
  INT_8 = 0x2,
  UINT_8 = 0x3,
  INT_16 = 0x4,
  UINT_16 = 0x5,
  INT_32 = 0x6,
  UINT_32 = 0x7,
  // UNKNOWN_1 = 0x8,
  FLOAT_32 = 0x9,
  INT_64 = 0xa,
  UINT_64 = 0xb,
  // UNKNOWN_2 = 0xc,

  // Read as <0>&0b1, <1>&0b10, <2>&0b100, &c
  PACKED_BOOL_0 = 0x19,
  PACKED_BOOL_1 = 0x1a,
  PACKED_BOOL_2 = 0x1b,
  PACKED_BOOL_3 = 0x1c,
  PACKED_BOOL_4 = 0x1d,
  PACKED_BOOL_5 = 0x1e,
  PACKED_BOOL_6 = 0x1f,
  PACKED_BOOL_7 = 0x20,
}
