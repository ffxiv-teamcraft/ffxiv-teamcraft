import { readFileSync } from 'fs';
import { join } from 'path';
import { AbstractExtractor } from '../../abstract-extractor';
import { kebabCase } from 'lodash';
import { LazyData } from '@ffxiv-teamcraft/data/model/lazy-data';
import { DataType, XivapiPatch } from '@ffxiv-teamcraft/types';

export abstract class AbstractItemDetailsExtractor<T> {

  constructor(protected xivapiPatches: XivapiPatch[]) {
  }

  protected requireLazyFile<T extends keyof LazyData>(name: T): LazyData[T] {
    return JSON.parse(readFileSync(join(AbstractExtractor.assetOutputFolder, `${kebabCase(name)}.json`), 'utf-8'));
  }

  public generateStars(amount: number): string {
    return new Array(amount).fill('★').join('');
  }

  public abstract doExtract(itemId: number, sources: { type: DataType, data: any }[]): T;

  public abstract getDataType(): DataType;

  protected getItemSource(sources: { type: DataType, data: any }[], type: DataType): any | undefined {
    return sources.find(s => s.type === type)?.data;
  }
}
