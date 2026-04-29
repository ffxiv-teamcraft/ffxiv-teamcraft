import { Pipe, PipeTransform, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';

@Pipe({
    name: 'materiaBonus',
    standalone: true
})
export class MateriaBonusPipe implements PipeTransform {
  private lazyData = inject(LazyDataFacade);


  transform(id: number): Observable<{ baseParamId: number, tier: number, value: number }> {
    return this.lazyData.getEntry('materias').pipe(
      map(materias => materias.find(m => m.itemId === id))
    );
  }
}
