import { Pipe, PipeTransform } from '@angular/core';
import { LazyDataService } from '../../core/data/lazy-data.service';

@Pipe({
  name: 'materiaBonus'
})
export class MateriaBonusPipe implements PipeTransform {
  constructor(private lazyData: LazyDataService) {
  }

  transform(id: number): { baseParamId: number, tier: number, value: number } {
    return this.lazyData.data.materias.find(m => m.itemId === id);
  }
}
