import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RotationsFacade } from '../../../../modules/rotations/+state/rotations.facade';
import { CraftingRotation } from '../../../../model/other/crafting-rotation';
import { combineLatest, Observable } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { RecipeChoicePopupComponent } from '../recipe-choice-popup/recipe-choice-popup.component';
import { NameQuestionPopupComponent } from '../../../../modules/name-question-popup/name-question-popup/name-question-popup.component';
import { filter, map, tap } from 'rxjs/operators';
import { CraftingRotationsFolder } from '../../../../model/other/crafting-rotations-folder';
import { RotationFoldersFacade } from '../../../../modules/rotation-folders/+state/rotation-folders.facade';

@Component({
  selector: 'app-rotations-page',
  templateUrl: './rotations-page.component.html',
  styleUrls: ['./rotations-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RotationsPageComponent {

  public loading$ = this.rotationsFacade.loading$;

  public rotations$: Observable<CraftingRotation[]>;

  public rotationFoldersDisplay$: Observable<{ folder: CraftingRotationsFolder, rotations: CraftingRotation[] }[]>;

  constructor(private rotationsFacade: RotationsFacade, private dialog: NzModalService, private translate: TranslateService,
              private foldersFacade: RotationFoldersFacade) {
    this.rotationsFacade.loadMyRotations();
    this.rotationFoldersDisplay$ = combineLatest([this.foldersFacade.myRotationFolders$, this.rotationsFacade.myRotations$]).pipe(
      tap(([folders, rotations]) => {
        const fixedFolders = folders
          .filter(folder => folder.$key !== undefined)
          .map(folder => {
            return {
              folder: folder,
              rotations: folder.rotationIds
                .filter(id => rotations.find(r => r.$key === id) !== undefined)
            };
          })
          .filter(entry => entry.rotations.length < entry.folder.rotationIds.length);
        fixedFolders.forEach(entry => {
          entry.folder.rotationIds = entry.rotations;
          this.foldersFacade.updateFolder(entry.folder);
        });
      }),
      map(([folders, rotations]) => {
        return folders
          .filter(folder => folder.$key !== undefined)
          .map(folder => {
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
      }),
      // Wrong order because of undefined rotations !!
      map(displays => displays.sort((a, b) => a.folder.index - b.folder.index))
    );

    this.rotations$ = combineLatest([this.rotationsFacade.myRotations$, this.foldersFacade.myRotationFolders$]).pipe(
      map(([rotations, folders]) => {
        return rotations.filter(rotation => {
          return folders.find(folder => {
            return folder.rotationIds.find(id => id === rotation.$key) !== undefined;
          }) === undefined;
        }).sort((a, b) => a.index - b.index);
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
    if (rotation.folderId !== undefined) {
      this.foldersFacade.removeRotationFromFolder(rotation.$key, rotation.folderId);
    }
    // Remove rotation from the array
    rotations = rotations.filter(r => r.$key !== rotation.$key);
    // Insert it at new index
    rotations.splice(index, 0, rotation);
    // Update indexes and persist
    rotations
      .map((r, i) => {
        if (r.index !== i) {
          r.index = i;
        }
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
      nzTitle: this.translate.instant('SIMULATOR.ROTATIONS.FOLDERS.New_folder')
    }).afterClose.pipe(
      filter(name => name !== undefined),
      map(name => {
        const folder = new CraftingRotationsFolder();
        folder.name = name;
        return folder;
      })
    ).subscribe(folder => this.foldersFacade.createFolder(folder));
  }

  setRotationFolderIndex(display: { folder: CraftingRotationsFolder, rotations: CraftingRotation[] },
                         index: number,
                         displays: { folder: CraftingRotationsFolder, rotations: CraftingRotation[] }[]): void {
    // Remove folder from the array
    displays = displays.filter(d => d.folder.$key !== display.folder.$key);
    // Insert it at new index
    displays.splice(index, 0, display);
    // Update indexes and persist
    displays
      .map(d => d.folder)
      .map((f, i) => {
        f.index = i;
        return f;
      })
      .forEach(f => {
        this.foldersFacade.updateFolder(f);
      });
  }

  trackByKey(index: number, rotation: CraftingRotation): string {
    return rotation.$key;
  }

}
