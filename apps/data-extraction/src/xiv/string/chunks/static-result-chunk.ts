import { SeStringChunk } from '../se-string-chunk';

export class StaticResultChunk extends SeStringChunk {
  constructor(private readonly result: string) {
    super();
  }

  public toString(): string {
    return this.result;
  }

}
