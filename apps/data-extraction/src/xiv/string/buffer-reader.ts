import { Buffer } from 'buffer';

type BufferFnProperties = Pick<Buffer,
  {
    [K in keyof Buffer]: Buffer[K] extends Function ? K : never
  }[keyof Buffer]>

export enum Endianness {
  LITTLE,
  BIG,
}

export class BufferReader {
  protected offset = 0;

  public get buffer(): Buffer {
    return this.buf;
  }

  public get reachedEnd(): boolean {
    return this.offset === this.buf.length;
  }

  public get remainingSize(): number {
    return this.buf.length - this.offset;
  }

  constructor(
    private readonly buf: Buffer,
    private readonly endianness: Endianness
  ) {
  }

  reset(): BufferReader {
    this.offset = 0;
    return this;
  }

  move(offset: number): BufferReader {
    this.offset = offset;
    return this;
  }

  skip(length: number): BufferReader {
    this.offset += length;
    return this;
  }

  skipUntil(byte: number): BufferReader {
    if (byte > 0xFF) {
      throw new Error('skipUntil can only work with a byte');
    }
    const index = this.buf.findIndex(b => b === byte);
    if (index === -1) {
      return this;
    }
    this.skip(index);
    return this;
  }

  slice(begin?: number, end?: number): Buffer {
    return this.buf.slice(begin, end);
  }

  string(length?: number) {
    if (!length) {
      length = this.buf.length - this.offset;
    }
    this.offset += length;
    try {
      return this.buf.toString('utf8', this.offset - length, this.offset);
    } catch (e) {
      return '';
    }
  }

  // This is the only function in here that isn't failsafe, be careful when using it
  getBuffer(length: number, asReader?: false): Buffer
  getBuffer(length: number, asReader: true): BufferReader
  getBuffer(length: number, asReader?: boolean): Buffer | BufferReader {
    const buf = this.buf.slice(this.offset, this.offset + length);
    this.offset += length;
    if (asReader) {
      return new BufferReader(buf, this.endianness);
    }
    return buf;
  }

  restAsBuffer(asReader?: false): Buffer
  restAsBuffer(asReader: true): BufferReader
  restAsBuffer(asReader?: boolean): Buffer | BufferReader {
    const length = this.buf.length - this.offset;
    const buf = this.buf.slice(this.offset, this.offset + length);
    if (asReader) {
      return new BufferReader(buf, this.endianness);
    }
    return buf;
  }

  array<T>(size: number, mapFn: (reader: BufferReader) => T): T[] {
    return new Array(size).fill(null).map(() => {
      return mapFn(this);
    });
  }

  int8(): number {
    return this.getNext('readInt8', 1);
  }

  uint8(): number {
    return this.getNext('readUInt8', 1);
  }

  uint16(): number {
    const fn = {
      [Endianness.LITTLE]: 'readUInt16LE',
      [Endianness.BIG]: 'readUInt16BE'
    }[this.endianness];
    return this.getNext(fn as keyof BufferFnProperties, 2);
  }

  int16(): number {
    const fn = {
      [Endianness.LITTLE]: 'readInt16LE',
      [Endianness.BIG]: 'readInt16BE'
    }[this.endianness];
    return this.getNext(fn as keyof BufferFnProperties, 2);
  }

  uint32(): number {
    const fn = {
      [Endianness.LITTLE]: 'readUInt32LE',
      [Endianness.BIG]: 'readUInt32BE'
    }[this.endianness];
    return this.getNext(fn as keyof BufferFnProperties, 4);
  }

  int32(): number {
    const fn = {
      [Endianness.LITTLE]: 'readInt32LE',
      [Endianness.BIG]: 'readInt32BE'
    }[this.endianness];
    return this.getNext(fn as keyof BufferFnProperties, 4);
  }

  uint64(): bigint {
    const fn = {
      [Endianness.LITTLE]: 'readBigUInt64LE',
      [Endianness.BIG]: 'readBigUInt64BE'
    }[this.endianness];
    return this.getNext(fn as keyof BufferFnProperties, 8);
  }

  int64(): bigint {
    const fn = {
      [Endianness.LITTLE]: 'readBigInt64LE',
      [Endianness.BIG]: 'readBigInt64BE'
    }[this.endianness];
    return this.getNext(fn as keyof BufferFnProperties, 8);
  }

  float(): number {
    const fn = {
      [Endianness.LITTLE]: 'readFloatLE',
      [Endianness.BIG]: 'readFloatBE'
    }[this.endianness];
    return this.getNext(fn as keyof BufferFnProperties, 4);
  }

  double(): number {
    const fn = {
      [Endianness.LITTLE]: 'readDoubleLE',
      [Endianness.BIG]: 'readDoubleBE'
    }[this.endianness];
    return this.getNext(fn as keyof BufferFnProperties, 8);
  }

  protected getNext<T>(fn: keyof BufferFnProperties, size: number): T {
    if (typeof this.buf[fn] !== 'function') {
      throw new Error(
        `Tried to read data using a non-function buffer prop, this shouldn't happen: ${String(fn)}`
      );
    }
    const value: T = (this.buf[fn] as Function)(this.offset);
    this.offset += size;
    return value;
  }
}
