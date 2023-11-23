import { Component } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { DataService } from '../../../../core/api/data.service';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { HtmlToolsService } from '../../../../core/tools/html-tools.service';
import { debounceTime, filter, map, startWith, switchMap, tap } from 'rxjs/operators';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { RotationPickerService } from '../../../../modules/rotations/rotation-picker.service';
import { Recipe } from '@ffxiv-teamcraft/types';
import { JobUnicodePipe } from '../../../../pipes/pipes/job-unicode.pipe';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { RouterLink } from '@angular/router';
import { ItemIconComponent } from '../../../../modules/item-icon/item-icon/item-icon.component';
import { I18nNameComponent } from '../../../../core/i18n/i18n-name/i18n-name.component';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NgIf, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-recipe-choice-popup',
    templateUrl: './recipe-choice-popup.component.html',
    styleUrls: ['./recipe-choice-popup.component.less'],
    standalone: true,
    imports: [NgIf, NzAlertModule, NzButtonModule, NzInputModule, NzIconModule, NzListModule, I18nNameComponent, ItemIconComponent, RouterLink, NzWaveModule, NzDividerModule, AsyncPipe, TranslateModule, JobUnicodePipe]
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
              private htmlTools: HtmlToolsService,
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
