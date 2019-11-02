import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { RotationsFacade } from '../../modules/rotations/+state/rotations.facade';
import { filter, map } from 'rxjs/operators';
import { CraftingRotation } from '../../model/other/crafting-rotation';

@Pipe({
  name: 'rotation'
})
export class RotationPipe implements PipeTransform {

  constructor(private facade: RotationsFacade) {
  }

  transform(key: string): Observable<CraftingRotation> {
    this.facade.getRotation(key);
    return this.facade.allRotations$.pipe(
      map(rotations => {
        return rotations.find(rotation => rotation.$key === key);
      }),
      filter(rotation => rotation !== undefined && !rotation.notFound)
    );
  }

}
