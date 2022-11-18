import { BufferReader } from './buffer-reader';
import { IntegerType } from './integer-type';

export function getNumber(reader: BufferReader): number {
  const type = reader.uint8();

  if (type < 0xF0) {
    return type - 1;
  }

  switch (type) {
    case IntegerType.Byte:
      return reader.uint8();
    case IntegerType.ByteTimes256:
      return reader.uint8() * 256;
    case IntegerType.Int16:
      return reader.uint16();
    case IntegerType.Int24:
      let res = 0;
      res |= reader.uint8() << 16;
      res |= reader.uint16();
      return res;
    case IntegerType.Int32:
      return reader.uint32();
  }
}
