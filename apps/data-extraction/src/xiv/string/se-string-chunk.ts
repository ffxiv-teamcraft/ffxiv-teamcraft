import { BufferReader } from './buffer-reader';

export abstract class SeStringChunk {
  constructor(protected readonly reader?: BufferReader) {
  }

  public abstract toString(): string;
}
