import { SeStringChunkType } from './se-string-chunk-type';
import { ParsedRow } from '../parsed-row';
import { BufferReader, Endianness } from './buffer-reader';
import { SeStringChunk } from './se-string-chunk';
import { StringChunk } from './chunks/string-chunk';
import { StaticResultChunk } from './chunks/static-result-chunk';
import { UIForegroundResultChunk } from './chunks/ui-foreground-result-chunk';
import { getNumber } from './get-number';
import { IfResultChunk } from './chunks/if-result-chunk';

export class SeString {

  private static START_PAYLOAD = 0x02;

  private static END_PAYLOAD = 0x03;

  private static CLOSING_TAG_START = 0xFF;

  private textDecoder = new TextDecoder();

  private chunks: SeStringChunk[] = [];

  constructor(buffer: Buffer, private readonly UIColor: ParsedRow[]) {
    const reader = new BufferReader(buffer, Endianness.BIG);
    this.decode(reader);
  }

  toString(): string {
    return this.chunks.reduce((acc, c) => acc + c.toString(), '');
  }

  private decode(reader: BufferReader): void {
    let staticStr = [];
    while (!reader.reachedEnd) {
      const byte = reader.uint8();
      // We found start payload !
      if (byte === SeString.START_PAYLOAD) {
        // First of all, push current static string payload to chunks
        if (staticStr.length > 0) {
          this.chunks.push(new StringChunk(new BufferReader(Buffer.from(staticStr), Endianness.BIG)));
          staticStr = [];
        }
        // Then handle payload
        this.chunks.push(this.handlePayload(reader));
      } else {
        staticStr.push(byte);
      }
    }
    this.chunks.push(new StringChunk(new BufferReader(Buffer.from(staticStr), Endianness.BIG)));
  }

  private handlePayload(reader: BufferReader): SeStringChunk {
    const payloadType = reader.uint8();
    // Get payload length
    const length = getNumber(reader);
    // Create a new reader for this payload to be parsed, will skip the size of the new reader
    const payloadReader = reader.getBuffer(length, true);
    // Skipping the end tag
    reader.skip(1);
    switch (payloadType) {
      case SeStringChunkType.NewLine:
        return new StaticResultChunk('<br>');
      case SeStringChunkType.Nbsp:
        return new StaticResultChunk('&nbsp;');
      case SeStringChunkType.SeHyphen:
        return new StaticResultChunk('-');
      case SeStringChunkType.UIForeground:
        return new UIForegroundResultChunk(payloadReader, this.UIColor);
      case SeStringChunkType.If:
        return new IfResultChunk(payloadReader, this.UIColor);
      // Idk what the hell UIGlow is supposed to do, let's just skip it for now
      case SeStringChunkType.UIGlow:
      // The ignored ones
      case 0x16:
      case 0x17:
        return new StaticResultChunk('');
      default:
        return new StaticResultChunk(`[UNHANDLED 0x${payloadType.toString(16).padStart(2, '0').toUpperCase()}]`);
    }
  }
}
