import { AbstractItemDetailsExtractor } from './abstract-item-details-extractor';
import { DataType } from '@ffxiv-teamcraft/types';
import { uniq } from 'lodash';
import { LazyRetainerTask } from '@ffxiv-teamcraft/data/model/lazy-retainer-task';

export class VenturesExtractor extends AbstractItemDetailsExtractor<Partial<LazyRetainerTask>[]> {
  retainerTasks = this.requireLazyFile('retainerTasks');

  ventureSources = this.requireLazyFile('ventureSources');


  doExtract(itemId: number): Partial<LazyRetainerTask>[] {
    const deterministic = this.retainerTasks.filter(task => task.item === itemId).map(task => task.id);
    const resultVentures = uniq([...deterministic, ...(this.ventureSources[itemId] || [])]);
    return resultVentures.map(id => {
      return this.retainerTasks.find(t => t.id === id) || { id };
    });
  }

  getDataType(): DataType {
    return DataType.VENTURES;
  }

}
