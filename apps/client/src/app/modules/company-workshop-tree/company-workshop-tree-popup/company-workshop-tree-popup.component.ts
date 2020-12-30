import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { Observable } from 'rxjs';
import { Ingredient } from '@ffxiv-teamcraft/simulator';
import { map } from 'rxjs/operators';
import { groupBy } from 'lodash';

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

  constructor(private modalRef: NzModalRef, private lazyData: LazyDataService) {
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
