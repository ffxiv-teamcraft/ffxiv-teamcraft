import { SeStringChunk } from '../se-string-chunk';
import { BufferReader } from '../buffer-reader';
import { ParsedRow } from '../../parsed-row';
import { getNumber } from '../get-number';

export class UIForegroundResultChunk extends SeStringChunk {

  public constructor(reader: BufferReader, private readonly UIColor: ParsedRow[]) {
    super(reader);
  }

  public toString(): string {
    // Closing tag
    if (this.reader.remainingSize === 1) {
      return `</span>`;
    }
    const colorId = getNumber(this.reader);
    const color = Number(this.UIColor.find(c => c.index === colorId)?.UIForeground || 0xFFFFFF);
    return `<span style="color:${this.numberToCssColor(color)}">`;
  }
}
