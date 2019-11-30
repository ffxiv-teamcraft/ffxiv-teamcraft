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
import { Craft } from '../../../model/garland-tools/craft';

@Component({
  selector: 'app-rotation-picker-drawer',
  templateUrl: './rotation-picker-drawer.component.html',
  styleUrls: ['./rotation-picker-drawer.component.less']
})
export class RotationPickerDrawerComponent {

  public itemId: number;

  public recipeId: string;

  public recipe: Partial<Craft>;

  public disableNew = false;

  public custom = false;

  public pickOnly = false;

  favoriteRotations$: Observable<CraftingRotation[]>;

  favoriteFolders$: Observable<{ folder: CraftingRotationsFolder, rotations: CraftingRotation[] }[]>;

  query$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  rotations$: Observable<CraftingRotation[]>;

  rotationFoldersDisplay$: Observable<{ folder: CraftingRotationsFolder, rotations: CraftingRotation[] }[]>;

  constructor(private rotationsFacade: RotationsFacade, private authFacade: AuthFacade,
              private rotationFoldersFacade: RotationFoldersFacade, public ref: NzDrawerRef<CraftingRotation>) {

    this.rotationFoldersDisplay$ = combineLatest([this.rotationFoldersFacade.myRotationFolders$, this.rotationsFacade.myRotations$, this.query$]).pipe(
      map(([folders, rotations, query]) => {
        return folders
          .filter(folder => folder.$key !== undefined)
          .map(folder => {
            return {
              folder: folder,
              rotations: folder.rotationIds.map(id => rotations.find(r => r.$key === id))
                .filter(r => r && !r.notFound && r.getName().toLowerCase().indexOf(query.toLowerCase()) > -1)
                .map(rotation => {
                  rotation.folderId = folder.$key;
                  return rotation;
                })
            };
          });
      }),
      map(displays => displays.sort((a, b) => a.folder.index - b.folder.index))
    );

    this.rotations$ = combineLatest([this.rotationsFacade.myRotations$, this.rotationFoldersFacade.myRotationFolders$, this.query$]).pipe(
      map(([rotations, folders, query]) => {
        return rotations.filter(rotation => {
          return rotation && !rotation.notFound && rotation.getName().indexOf(query) > -1 && folders.find(folder => {
            return folder.rotationIds.find(id => id === rotation.$key) !== undefined;
          }) === undefined;
        })
          .filter(r => !r.notFound)
          .sort((a, b) => a.index - b.index);
      })
    );

    this.favoriteRotations$ = this.authFacade.favorites$.pipe(
      map(favorites => (favorites.rotations || [])),
      tap(rotations => rotations.forEach(rotation => this.rotationsFacade.getRotation(rotation))),
      switchMap(rotations => {
        return this.rotationsFacade.allRotations$.pipe(
          map(loadedRotations => loadedRotations.filter(r => r && !r.notFound && r.getName !== undefined && rotations.indexOf(r.$key) > -1)),
          filter(loadedRotations => loadedRotations.length === rotations.length)
        );
      })
    );

    this.favoriteFolders$ = combineLatest([this.rotationFoldersFacade.favoriteRotationFolders$, this.query$]).pipe(
      map(([folders, query]) => {
        return folders
          .filter(folder => {
            return folder.rotations.some(rotation => rotation && !rotation.notFound && rotation.getName().toLowerCase().indexOf((query || '').toLowerCase()) > -1);
          })
          .map(folder => {
            folder.rotations = folder.rotations.filter(rotation => rotation && !rotation.notFound && rotation.getName().toLowerCase().indexOf((query || '').toLowerCase()) > -1);
            return folder;
          });
      })
    );

    this.rotationFoldersFacade.loadMyRotationFolders();
  }
}
