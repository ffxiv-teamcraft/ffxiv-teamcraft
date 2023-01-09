import { SeStringChunk } from '../se-string-chunk';
import { getNumber } from '../get-number';
import { SeString } from '../se-string';
import { BufferReader } from '../buffer-reader';
import { ParsedRow } from '../../parsed-row';

export class IfResultChunk extends SeStringChunk {
  constructor(reader: BufferReader, private readonly UIColor: ParsedRow[]) {
    super(reader);
  }

  public toString(): string {
    // This is the type of the expression, but since we don't parse conditions, we just ignore it
    this.reader.uint8();
    // Let's skip condition definition, we don't care about it
    this.reader.skipUntil(0xFF);
    const contentSize = getNumber(this.reader);
    return new SeString(this.reader.getBuffer(contentSize), this.UIColor).toString();
  }
}
