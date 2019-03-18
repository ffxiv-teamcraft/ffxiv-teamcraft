import { Component } from '@angular/core';
import { AuthFacade } from '../../../+state/auth.facade';
import { craftingLogPages } from '../../../core/data/sources/crafting-log-pages';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { filter, first, map, mergeMap, tap } from 'rxjs/operators';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { combineLatest, concat, Observable, of } from 'rxjs';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-log-tracker',
  templateUrl: './log-tracker.component.html',
  styleUrls: ['./log-tracker.component.less']
})
export class LogTrackerComponent {

  public dohTabs: any[];

  private dohPageNameCache: { [index: number]: string } = {};

  public userCompletion: { [index: number]: boolean } = {};

  public dohSelectedPage = 0;

  public type$: Observable<number>;

  constructor(private authFacade: AuthFacade, private gt: GarlandToolsService, private translate: TranslateService,
              private listsFacade: ListsFacade, private listManager: ListManagerService, private listPicker: ListPickerService,
              private progressService: ProgressPopupService, private router: Router, private route: ActivatedRoute) {
    this.dohTabs = [...craftingLogPages];
    this.authFacade.user$.pipe(
      map(user => user.logProgression)
    ).subscribe(completion => {
      this.userCompletion = {};
      completion.forEach(recipeId => {
        this.userCompletion[recipeId] = true;
      });
    });
    this.type$ = this.route.paramMap.pipe(
      map(params => {
        const type = params.get('type');
        // We have to +1 it because javascript evaluates 0 as false and we use it inside a *ngIf
        return ['DoH', 'DoL', 'FSH'].indexOf(type) + 1;
      })
    );
  }

  public setType(index: number): void {
    this.router.navigate(['../', ['DoH', 'DoL', 'FSH'][index]], {
      relativeTo: this.route
    });
  }

  public createList(page: any): void {
    const recipesToAdd = page.recipes.filter(recipe => !this.userCompletion[recipe.recipeId]);
    this.listPicker.pickList().pipe(
      mergeMap(list => {
        const operations = recipesToAdd.map(recipe => {
          return this.listManager.addToList(recipe.itemId, list, recipe.recipeId, 1);
        });
        let operation$: Observable<any>;
        if (operations.length > 0) {
          operation$ = concat(
            ...operations
          );
        } else {
          operation$ = of(list);
        }
        return this.progressService.showProgress(operation$,
          recipesToAdd.length,
          'Adding_recipes',
          { amount: recipesToAdd.length, listname: list.name });
      }),
      tap(list => list.$key ? this.listsFacade.updateList(list) : this.listsFacade.addList(list)),
      mergeMap(list => {
        // We want to get the list created before calling it a success, let's be pessimistic !
        return this.progressService.showProgress(
          combineLatest(this.listsFacade.myLists$, this.listsFacade.listsWithWriteAccess$).pipe(
            map(([myLists, listsICanWrite]) => [...myLists, ...listsICanWrite]),
            map(lists => lists.find(l => l.createdAt === list.createdAt && l.$key === list.$key && l.$key !== undefined)),
            filter(l => l !== undefined),
            first()
          ), 1, 'Saving_in_database');
      })
    ).subscribe((list) => {
      this.router.navigate(['/list', list.$key]);
    });
  }

  public getPageCompletion(page: any): string {
    return `${page.recipes.filter(recipe => this.userCompletion[recipe.recipeId]).length}/${page.recipes.length}`;
  }

  public getIcon(index: number): string {
    return `./assets/icons/classjob/${this.gt.getJob(index + 8).name.toLowerCase()}.png`;
  }

  public markAsDone(recipeId: number, done: boolean): void {
    this.authFacade.user$.pipe(first()).subscribe(user => {
      if (done) {
        user.logProgression.push(recipeId);
      } else {
        user.logProgression = user.logProgression.filter(entry => entry !== recipeId);
      }
      this.userCompletion[recipeId] = done;
      this.authFacade.updateUser(user);
    });
  }

  public markPageAsDone(page: any): void {
    this.authFacade.user$.pipe(first()).subscribe(user => {
      user.logProgression.push(...page.recipes.map(r => {
        this.userCompletion[r.recipeId] = true;
        return r.recipeId;
      }));
      this.authFacade.updateUser(user);
    });
  }

  public getPageName(page: any): string {
    if (this.dohPageNameCache[page.id] === undefined) {
      this.dohPageNameCache[page.id] = this._getPageName(page);
    }
    return this.dohPageNameCache[page.id];
  }

  public isRequiredForAchievement(page: any): boolean {
    return (!page.masterbook
      && page.startLevel.ClassJobLevel !== 50
      && page.startLevel.ClassJobLevel !== 30)
      || (page.id > 1055 && page.id < 1072);
  }

  private _getPageName(page: any): string {
    if (page.masterbook > 0) {
      const masterbookIndex = this.getMasterbookIndex(page);
      if (masterbookIndex === -7) {
        return this.translate.instant('LOG_TRACKER.PAGE.Other_master_recipes');
      }
      const masterbookNumber = Math.floor((page.id - 1000) / 8) + 1;
      return `${this.translate.instant('LOG_TRACKER.PAGE.Master_recipes', { number: masterbookNumber })}`;
    }
    if (page.id > 1055 && page.id < 1072) {
      return `${this.translate.instant('LOG_TRACKER.PAGE.Housing_items', { number: page.id < 1064 ? 1 : 2 })}`;
    }
    if (page.startLevel.ClassJobLevel === 50) {
      return this.translate.instant('LOG_TRACKER.PAGE.Others');
    }
    if (page.startLevel.ClassJobLevel === 30) {
      return this.translate.instant('LOG_TRACKER.PAGE.Dyes');
    }
    return `${page.startLevel.ClassJobLevel} - ${page.startLevel.ClassJobLevel + 4}`;
  }

  private getMasterbookIndex(page: any): number {
    const baseValue = ((page.startLevel.ClassJobLevel - 50) / 5) + page.startLevel.Stars / 2;
    if (baseValue === 1.6) {
      return 3;
    }
    if (baseValue > 2) {
      return baseValue + 1;
    }
    return baseValue;
  }

}
