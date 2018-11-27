import { Component } from '@angular/core';
import { RotationsFacade } from '../../../../modules/rotations/+state/rotations.facade';
import { CraftingRotation } from '../../../../model/other/crafting-rotation';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-rotations-page',
  templateUrl: './rotations-page.component.html',
  styleUrls: ['./rotations-page.component.less']
})
export class RotationsPageComponent {

  public rotations$: Observable<CraftingRotation[]>;

  constructor(private rotationsFacade: RotationsFacade) {
    this.rotations$ = this.rotationsFacade.myRotations$;
  }

  setRotationIndex(rotation: CraftingRotation, index: number, rotations: CraftingRotation[]): void {
    // TODO remove from folder
    // if (list.workshopId !== undefined) {
    //   this.workshopsFacade.removeListFromWorkshop(list.$key, list.workshopId);
    // }
    // Remove list from the array
    rotations = rotations.filter(r => r.$key !== rotation.$key);
    // Insert it at new index
    rotations.splice(index, 0, rotation);
    // Update indexes and persist
    rotations
      .filter((r, i) => r.index !== i)
      .map((r, i) => {
        r.index = i;
        return r;
      })
      .forEach(r => {
        this.rotationsFacade.updateRotation(r);
      });
  }

  trackByRotation(index: number, rotation: CraftingRotation): string {
    return rotation.$key;
  }

}
