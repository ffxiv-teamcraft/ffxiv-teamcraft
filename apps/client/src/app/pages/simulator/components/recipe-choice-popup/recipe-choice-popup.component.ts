import { Component } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { DataService } from '../../../../core/api/data.service';
import { NzModalRef } from 'ng-zorro-antd';
import { Recipe } from '../../../../model/search/recipe';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { HtmlToolsService } from '../../../../core/tools/html-tools.service';
import { debounceTime, filter, map, startWith, switchMap, tap } from 'rxjs/operators';

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

  constructor(private dataService: DataService, private dialogRef: NzModalRef,
              private gt: GarlandToolsService, private htmlTools: HtmlToolsService) {
    this.results$ = this.query$.pipe(
      debounceTime(500),
      filter(query => query.length > 3),
      tap(() => this.loading = true),
      switchMap(query => {
        return this.dataService.searchItem(query, [], true);
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

  close(): void {
    this.dialogRef.close();
  }
}
