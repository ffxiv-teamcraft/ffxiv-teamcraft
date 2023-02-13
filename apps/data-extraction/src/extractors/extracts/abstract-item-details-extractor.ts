import { readFileSync } from 'fs';
import { join } from 'path';
import { AbstractExtractor } from '../../abstract-extractor';
import { kebabCase } from 'lodash';
import { LazyData } from '@ffxiv-teamcraft/data/model/lazy-data';

export abstract class AbstractItemDetailsExtractor<T> {

  protected requireLazyFile<T extends keyof LazyData>(name: T): LazyData[T] {
    return JSON.parse(readFileSync(join(AbstractExtractor.assetOutputFolder, `${kebabCase(name)}.json`), 'utf-8'));
  }

  public generateStars(amount: number): string {
    let stars = '';
    for (let i = 0; i < amount; i++) {
      stars += '★';
    }
    return stars;
  }

  public abstract doExtract(itemId: number): T;

  public abstract getDataType(): any;
}
