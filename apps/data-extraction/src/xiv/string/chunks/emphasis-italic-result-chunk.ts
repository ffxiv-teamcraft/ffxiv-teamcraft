import { SeStringChunk } from '../se-string-chunk';

export class EmphasisItalicResultChunk extends SeStringChunk {

  public toString(): string {
    const param = this.reader.uint8();
    // param is 2: open, 1: close
    switch (param) {
      case 2:
        return '<i>';
      case 1:
        return '</i>';
      default:
        throw new Error(`Wrong Emphasis Italic param: 0x${param.toString(16)}`);
    }
  }
}
