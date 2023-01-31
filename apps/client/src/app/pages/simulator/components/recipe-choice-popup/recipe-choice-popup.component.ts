import { Component } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { DataService } from '../../../../core/api/data.service';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { HtmlToolsService } from '../../../../core/tools/html-tools.service';
import { debounceTime, filter, map, startWith, switchMap, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { RotationPickerService } from '../../../../modules/rotations/rotation-picker.service';
import { Recipe } from '@ffxiv-teamcraft/trpc-api';

@Component({
  selector: 'app-recipe-choice-popup',
  templateUrl: './recipe-choice-popup.component.html',
  styleUrls: ['./recipe-choice-popup.component.less']
})
export class RecipeChoicePopupComponent {

  public query$: ReplaySubject<string> = new ReplaySubject<string>();

  public results$: Observable<Recipe[]>;

  loading = false;

  showCustom = false;

  warning: string;

  rotationId: string;

  statsStr: string;

  pickRotation: boolean;

  constructor(private dataService: DataService, private dialogRef: NzModalRef,
              private gt: GarlandToolsService, private htmlTools: HtmlToolsService,
              private translate: TranslateService, private rotationPickerService: RotationPickerService) {
    this.results$ = this.query$.pipe(
      filter(query => {
        if (['ko', 'zh', 'ja'].indexOf(this.translate.currentLang.toLowerCase()) > -1) {
          // Chinese and korean characters system use fewer chars for the same thing, filters have to be handled accordingly.
          return query.length > 0;
        }
        return query.length > 3;
      }),
      tap(() => this.loading = true),
      debounceTime(500),
      switchMap(query => {
        return this.dataService.searchItem(query, [], true, [null, 'desc'], true);
      }),
      map(results => {
        return results.map(res => res.recipe).filter(recipe => recipe !== undefined);
      }),
      tap(() => this.loading = false),
      startWith([])
    );
  }

  /**
   * Gets job informations from a given job id.
   * @param {number} id
   * @returns {any}
   */
  getJob(id: number): any {
    return this.gt.getJob(id);
  }

  /**
   * Generates star html string for recipes with stars.
   * @param {number} nb
   * @returns {string}
   */
  getStars(nb: number): string {
    return this.htmlTools.generateStars(nb);
  }


  openRotationPicker(recipe: Recipe): void {
    this.rotationPickerService.openInSimulator(recipe.itemId, recipe.recipeId, false, false, this.statsStr);
    this.close();
  }

  close(): void {
    this.dialogRef.close(true);
  }
}
