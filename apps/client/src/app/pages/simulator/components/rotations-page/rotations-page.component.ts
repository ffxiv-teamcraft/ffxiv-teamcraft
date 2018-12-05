import { Component } from '@angular/core';
import { RotationsFacade } from '../../../../modules/rotations/+state/rotations.facade';
import { CraftingRotation } from '../../../../model/other/crafting-rotation';
import { Observable } from 'rxjs/Observable';
import { NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { RecipeChoicePopupComponent } from '../recipe-choice-popup/recipe-choice-popup.component';
import { NameQuestionPopupComponent } from '../../../../modules/name-question-popup/name-question-popup/name-question-popup.component';
import { filter, map } from 'rxjs/operators';
import { CraftingRotationsFolder } from '../../../../model/other/crafting-rotations-folder';
import { RotationFoldersFacade } from '../../../../modules/rotation-folders/+state/rotation-folders.facade';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-rotations-page',
  templateUrl: './rotations-page.component.html',
  styleUrls: ['./rotations-page.component.less']
})
export class RotationsPageComponent {

  public rotations$: Observable<CraftingRotation[]>;

  public rotationFoldersDisplay$: Observable<{ folder: CraftingRotationsFolder, rotations: CraftingRotation[] }[]>;

  constructor(private rotationsFacade: RotationsFacade, private dialog: NzModalService, private translate: TranslateService,
              private foldersFacade: RotationFoldersFacade) {
    this.rotations$ = this.rotationsFacade.myRotations$;
    this.rotationFoldersDisplay$ = combineLatest(this.foldersFacade.myRotationFolders$, this.rotations$).pipe(
      map(([folders, rotations]) => {
        return folders.map(folder => {
          return {
            folder: folder,
            rotations: folder.rotationIds.map(id => rotations.find(r => r.$key === id))
              .filter(r => r !== undefined)
              .map(rotation => {
                rotation.folderId = folder.$key;
                return rotation;
              })
          };
        });
      })
    );
    this.foldersFacade.loadMyRotationFolders();
  }

  newRotation(): void {
    this.dialog.create({
      nzFooter: null,
      nzContent: RecipeChoicePopupComponent,
      nzComponentParams: {
        showCustom: true
      },
      nzTitle: this.translate.instant('Pick_a_recipe')
    });
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

  newFolder(): void {
    this.dialog.create({
      nzContent: NameQuestionPopupComponent,
      nzFooter: null,
      nzTitle: this.translate.instant('SIMULATOR.ROTATIONS.FOLDER.New_folder')
    }).afterClose.pipe(
      filter(name => name !== undefined),
      map(name => {
        const folder = new CraftingRotationsFolder();
        folder.name = name;
        return folder;
      })
    ).subscribe(folder => this.foldersFacade.createFolder(folder));
  }

  trackByRotation(index: number, rotation: CraftingRotation): string {
    return rotation.$key;
  }

}
