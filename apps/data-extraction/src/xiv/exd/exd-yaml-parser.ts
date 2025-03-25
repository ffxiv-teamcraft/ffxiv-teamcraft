import { join } from 'path';
import { parse } from 'yaml';
import { EXDSchema } from './EXDSchema';
import { readFileSync } from 'fs';

export class ExdYamlParser {

  constructor(private readonly folder: string) {
  }

  parseEXDYaml(sheet: string): EXDSchema {
    const content = readFileSync(join(this.folder, `${sheet}.yml`), 'utf-8');
    return parse(content);
  }

}
