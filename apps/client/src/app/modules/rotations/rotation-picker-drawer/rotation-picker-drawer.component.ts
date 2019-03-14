import { Component } from '@angular/core';
import { RotationsFacade } from '../+state/rotations.facade';
import { NzDrawerRef } from 'ng-zorro-antd';
import { CraftingRotation } from '../../../model/other/crafting-rotation';
import { Observable } from 'rxjs/Observable';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { RotationFoldersFacade } from '../../rotation-folders/+state/rotation-folders.facade';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { CraftingRotationsFolder } from '../../../model/other/crafting-rotations-folder';

@Component({
  selector: 'app-rotation-picker-drawer',
  templateUrl: './rotation-picker-drawer.component.html',
  styleUrls: ['./rotation-picker-drawer.component.less']
})
export class RotationPickerDrawerComponent {

  public itemId: number;

  public recipeId: string;

  public disableNew = false;

  public custom = false;

  favoriteRotations$: Observable<CraftingRotation[]>;

  favoriteFolders$: Observable<{ folder: CraftingRotationsFolder, rotations: CraftingRotation[] }[]>;

  query$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  rotations$ = combineLatest(this.rotationsFacade.myRotations$, this.query$).pipe(
    map(([rotations, query]) => {
      return rotations.filter(rotation => rotation.getName().toLowerCase().indexOf((query || '').toLowerCase()) > -1);
    })
  );

  constructor(private rotationsFacade: RotationsFacade, private authFacade: AuthFacade,
              private rotationFoldersFacade: RotationFoldersFacade, public ref: NzDrawerRef<CraftingRotation>) {
    this.favoriteRotations$ = this.authFacade.favorites$.pipe(
      map(favorites => (favorites.rotations || [])),
      tap(rotations => rotations.forEach(rotation => this.rotationsFacade.getRotation(rotation))),
      switchMap(rotations => {
        return this.rotationsFacade.allRotations$.pipe(
          map(loadedRotations => loadedRotations.filter(r => rotations.indexOf(r.$key) > -1)),
          filter(loadedRotations => loadedRotations.length === rotations.length)
        );
      })
    );

    this.favoriteFolders$ = combineLatest(this.rotationFoldersFacade.favoriteRotationFolders$, this.query$).pipe(
      map(([folders, query]) => {
        return folders
          .filter(folder => {
            return folder.rotations.some(rotation => rotation.getName().toLowerCase().indexOf((query || '').toLowerCase()) > -1);
          })
          .map(folder => {
            folder.rotations = folder.rotations.filter(rotation => rotation.getName().toLowerCase().indexOf((query || '').toLowerCase()) > -1);
            return folder;
          });
      })
    );
  }
}
