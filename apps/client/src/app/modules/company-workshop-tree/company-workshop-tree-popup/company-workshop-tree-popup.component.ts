import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { Observable } from 'rxjs';
import { Ingredient } from '@ffxiv-teamcraft/simulator';
import { map } from 'rxjs/operators';
import { groupBy } from 'lodash';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { I18nPipe } from '../../../core/i18n.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { DialogComponent } from '../../../core/dialog.component';

interface WorkshopTreeNode {
  index: number,
  ingredients: Ingredient[]
}

@Component({
    selector: 'app-company-workshop-tree-popup',
    templateUrl: './company-workshop-tree-popup.component.html',
    styleUrls: ['./company-workshop-tree-popup.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [AsyncPipe, TranslateModule, ItemNamePipe, I18nPipe]
})
export class CompanyWorkshopTreePopupComponent extends DialogComponent implements OnInit {

  workshopRecipeId: string;

  display$: Observable<WorkshopTreeNode[]>;

  constructor(private lazyData: LazyDataFacade) {
    super();
  }

  ngOnInit(): void {
    this.patchData();
    this.display$ = this.lazyData.getRecipe(this.workshopRecipeId).pipe(
      map(recipe => {
        return Object.entries(groupBy(recipe.ingredients, 'phase'))
          .map(([key, value]) => {
            return {
              index: +key,
              ingredients: value
            };
          });
      })
    );
  }

}
