import { Component } from '@angular/core';
import { RotationsFacade } from '../../../../modules/rotations/+state/rotations.facade';
import { CraftingRotation } from '../../../../model/other/crafting-rotation';
import { Observable } from 'rxjs/Observable';
import { NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { RecipeChoicePopupComponent } from '../recipe-choice-popup/recipe-choice-popup.component';

@Component({
  selector: 'app-rotations-page',
  templateUrl: './rotations-page.component.html',
  styleUrls: ['./rotations-page.component.less']
})
export class RotationsPageComponent {

  public rotations$: Observable<CraftingRotation[]>;

  constructor(private rotationsFacade: RotationsFacade, private dialog: NzModalService, private translate: TranslateService) {
    this.rotations$ = this.rotationsFacade.myRotations$;
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

  trackByRotation(index: number, rotation: CraftingRotation): string {
    return rotation.$key;
  }

}
