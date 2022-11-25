import { SeStringChunk } from '../se-string-chunk';

export class StringChunk extends SeStringChunk {
  public toString(): string {
    return this.reader.string();
  }
}
