import { Component } from '@angular/core';
import { RotationsFacade } from '../+state/rotations.facade';
import { NzDrawerRef } from 'ng-zorro-antd';
import { CraftingRotation } from '../../../model/other/crafting-rotation';
import { Observable } from 'rxjs/Observable';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';

@Component({
  selector: 'app-rotation-picker-drawer',
  templateUrl: './rotation-picker-drawer.component.html',
  styleUrls: ['./rotation-picker-drawer.component.less']
})
export class RotationPickerDrawerComponent {

  rotations$ = this.rotationsFacade.myRotations$;

  public itemId: number;

  public recipeId: string;

  public disableNew = false;

  public custom = false;

  favoriteRotations$: Observable<CraftingRotation[]>;

  constructor(private rotationsFacade: RotationsFacade, private authFacade: AuthFacade, public ref: NzDrawerRef<CraftingRotation>) {
    this.favoriteRotations$ = this.authFacade.favorites$.pipe(
      map(favorites => favorites.rotations),
      tap(rotations => rotations.forEach(rotation => this.rotationsFacade.getRotation(rotation))),
      switchMap(rotations => {
        return this.rotationsFacade.allRotations$.pipe(
          map(loadedRotations => loadedRotations.filter(r => rotations.indexOf(r.$key) > -1)),
          filter(loadedRotations => loadedRotations.length === rotations.length)
        );
      })
    );
  }
}
