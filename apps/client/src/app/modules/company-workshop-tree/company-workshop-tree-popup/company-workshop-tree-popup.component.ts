import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { Observable } from 'rxjs';
import { Ingredient } from '@ffxiv-teamcraft/simulator';
import { map } from 'rxjs/operators';
import { groupBy } from 'lodash';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';

interface WorkshopTreeNode {
  index: number,
  ingredients: Ingredient[]
}

@Component({
  selector: 'app-company-workshop-tree-popup',
  templateUrl: './company-workshop-tree-popup.component.html',
  styleUrls: ['./company-workshop-tree-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyWorkshopTreePopupComponent implements OnInit {

  workshopRecipeId: string;

  display$: Observable<WorkshopTreeNode[]>;

  constructor(private modalRef: NzModalRef, private lazyData: LazyDataFacade) {
  }

  ngOnInit(): void {
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
