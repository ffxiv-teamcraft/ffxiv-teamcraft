import { readdirSync } from 'fs-extra';
import { join } from 'path';
import { parse } from 'yaml';
import { EXDSchema } from './EXDSchema';
import { readFileSync } from 'fs';

export class ExdYamlParser {

  private readonly folder: string;

  constructor(baseFolder: string, version: string) {
    if (version == 'latest') {
      const schemas = join(baseFolder, 'Schemas');
      const latest = readdirSync(schemas).sort().reverse()[0];
      this.folder = join(schemas, latest);
    }
  }

  parseEXDYaml(sheet: string): EXDSchema {
    const content = readFileSync(join(this.folder, `${sheet}.yml`), 'utf-8');
    return parse(content);
  }

}
