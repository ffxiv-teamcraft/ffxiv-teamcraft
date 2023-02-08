import { Component } from '@angular/core';
import { BehaviorSubject, combineLatest, concat, Observable, of } from 'rxjs';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { GearsetsFacade } from '../../../modules/gearsets/+state/gearsets.facade';
import { first, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { TranslateService } from '@ngx-translate/core';
import { StatsService } from '../../../modules/gearsets/stats.service';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { GearsetComparatorPopupComponent } from '../../../modules/gearsets/gearset-comparator-popup/gearset-comparator-popup.component';
import { MateriaService } from '../../../modules/gearsets/materia.service';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { List } from '../../../modules/list/model/list';
import { RecipeChoicePopupComponent } from '../../simulator/components/recipe-choice-popup/recipe-choice-popup.component';
import { BaseParam } from '@ffxiv-teamcraft/data/game';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { AuthFacade } from '../../../+state/auth.facade';
import { GearsetProgression, newEmptyProgression } from '../../../model/gearset/gearset-progression';
import { Clipboard } from '@angular/cdk/clipboard';
import { CommissionsFacade } from '../../../modules/commission-board/+state/commissions.facade';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { withLazyData } from '../../../core/rxjs/with-lazy-data';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';
import { EnvironmentService } from '../../../core/environment.service';
import { LocalStorageBehaviorSubject } from '../../../core/rxjs/local-storage-behavior-subject';

@Component({
  selector: 'app-gearset-display',
  templateUrl: './gearset-display.component.html',
  styleUrls: ['./gearset-display.component.less']
})
export class GearsetDisplayComponent extends TeamcraftComponent {

  public progression$: Observable<GearsetProgression> = this.gearsetsFacade.selectedGearsetProgression$;

  public gearsetSlotProperties: Array<keyof TeamcraftGearset | null>[] = [
    ['mainHand', 'offHand'],
    ['head', 'earRings'],
    ['chest', 'necklace'],
    ['gloves', 'bracelet'],
    [this.env.gameVersion < 6 ? 'belt' : null, 'ring1'],
    ['legs', 'ring2'],
    ['feet', 'crystal']
  ];

  public level$ = new BehaviorSubject<number>(this.env.maxLevel);

  public tribe$ = new LocalStorageBehaviorSubject<number>('gearsets: tribe', 1);

  public food$ = new BehaviorSubject<any>(null);

  public gearset$: Observable<TeamcraftGearset> = this.gearsetsFacade.selectedGearset$.pipe(
    tap(gearset => {
      if (gearset.food) {
        this.food$.next(gearset.food);
      }
    })
  );

  public stats$: Observable<{ id: number, value: number }[]> = combineLatest([this.gearsetsFacade.selectedGearset$, this.level$, this.tribe$, this.food$]).pipe(
    switchMap(([set, level, tribe, food]) => {
      return this.statsService.getStats(set, level, tribe, food);
    })
  );

  public foods$: Observable<any[]> = this.gearset$.pipe(
    first(),
    withLazyData(this.lazyData, 'foods'),
    map(([gearset, foods]) => {
      const relevantStats = this.statsService.getRelevantBaseStats(gearset.job);
      return [].concat.apply([], foods
        .filter(food => {
          return Object.values<any>(food.Bonuses).some(stat => relevantStats.indexOf(stat.ID) > -1);
        })
        .map(food => {
          return [{ ...food, HQ: false }, { ...food, HQ: true }];
        }));
    })
  );

  tribesMenu = this.gearsetsFacade.tribesMenu;

  maxLevel = this.env.maxLevel;

  permissionLevel$: Observable<PermissionLevel> = this.gearsetsFacade.selectedGearsetPermissionLevel$;

  userId$: Observable<string> = this.authFacade.userId$;

  loggedIn$: Observable<boolean> = this.authFacade.loggedIn$;

  includeAllTools = localStorage.getItem('gearsets:include-all-tools') === 'true';

  constructor(private gearsetsFacade: GearsetsFacade, private activatedRoute: ActivatedRoute,
              public translate: TranslateService, private statsService: StatsService,
              private dialog: NzModalService, private materiaService: MateriaService,
              private listPicker: ListPickerService, private listManager: ListManagerService,
              private listsFacade: ListsFacade, private progressService: ProgressPopupService,
              private notificationService: NzNotificationService, private lazyData: LazyDataFacade,
              private router: Router, private i18n: I18nToolsService,
              private message: NzMessageService,
              private authFacade: AuthFacade, private clipboard: Clipboard,
              private commissionsFacade: CommissionsFacade, private env: EnvironmentService) {
    super();
    this.activatedRoute.paramMap
      .pipe(
        map(params => params.get('setId')),
        tap((setId: string) => this.gearsetsFacade.load(setId)),
        takeUntil(this.onDestroy$)
      )
      .subscribe(setId => {
        this.gearsetsFacade.select(setId);
        this.gearsetsFacade.loadProgression(setId);
      });
  }

  openSimulator(gearset: TeamcraftGearset): void {
    this.statsService.getStats(gearset, this.level$.value, 11, this.food$.value)
      .pipe(
        first()
      )
      .subscribe(stats => {
        const craftsmanship = stats.find(s => s.id === BaseParam.CRAFTSMANSHIP).value;
        const control = stats.find(s => s.id === BaseParam.CONTROL).value;
        const cp = stats.find(s => s.id === BaseParam.CP).value;
        const specialist = !!gearset.crystal;
        this.dialog.create({
          nzFooter: null,
          nzContent: RecipeChoicePopupComponent,
          nzComponentParams: {
            statsStr: `${craftsmanship}/${control}/${cp}/${this.level$.value}/${specialist ? 1 : 0}`,
            pickRotation: true
          },
          nzTitle: this.translate.instant('Pick_a_recipe')
        });

      });
  }

  compare(gearset: TeamcraftGearset): void {
    this.dialog.create({
      nzTitle: this.translate.instant('GEARSETS.COMPARISON.Compare_popup_title', { setName: gearset.name }),
      nzContent: GearsetComparatorPopupComponent,
      nzComponentParams: {
        gearset: gearset,
        includeAllTools: this.includeAllTools
      },
      nzFooter: null
    });
  }

  clone(gearset: TeamcraftGearset): void {
    this.gearsetsFacade.clone(gearset);
  }

  foodComparator(a: any, b: any): boolean {
    return a === b || ((a && a.ID) === (b && b.ID) && a.HQ === b.HQ);
  }

  generateList(gearset: TeamcraftGearset, progression: GearsetProgression): void {
    this.materiaService.getTotalNeededMaterias(gearset, this.includeAllTools, progression).pipe(
      map(materias => {
        return [
          ...this.gearsetsFacade.toArray(gearset)
            .filter(piece => {
              return progression[piece.slot]?.item === false;
            })
            .map(entry => {
              return {
                id: entry.piece.itemId,
                amount: 1
              };
            }),
          ...materias
        ];
      })
    ).subscribe(items => {
      this.listPicker.addToList(...items);
    });
  }

  resetProgression(gearset: TeamcraftGearset): void {
    this.gearsetsFacade.saveProgression(gearset.$key, { ...newEmptyProgression() });
  }

  createCommission(gearset: TeamcraftGearset, progression: GearsetProgression): void {
    this.lazyData.getRecipes().pipe(
      switchMap(recipes => {
        const list = new List();
        list.name = gearset.name;
        const items = this.gearsetsFacade.toArray(gearset)
          .filter(piece => {
            return progression[piece.slot]?.item === false;
          })
          .map(entry => {
            return {
              id: entry.piece.itemId,
              amount: 1
            };
          });
        const operations = items.map(item => {
          const recipe = recipes.find(r => r.result === item.id);
          return this.listManager.addToList({
            itemId: +item.id,
            list: list,
            recipeId: recipe ? recipe.id : '',
            amount: item.amount
          });
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
          items.length,
          'Adding_recipes',
          { amount: items.length, listname: list.name })
          .pipe(
            switchMap(l => {
              return this.listsFacade.addListAndWait(l);
            })
          );
      })
    ).subscribe(resList => {
      this.commissionsFacade.create(resList);
    });
  }

  copyToClipboard(gearset: TeamcraftGearset): void {
    this.getString(gearset).subscribe(res => {
      if (this.clipboard.copy(res)) {
        this.message.success(this.translate.instant('GEARSETS.Copied_as_string'));
      }
    });
  }

  getString(gearset: TeamcraftGearset): Observable<string> {
    return safeCombineLatest(
      this.gearsetsFacade.toArray(gearset)
        .filter(entry => entry.piece !== null)
        .map(entry => {
          return this.i18n.getNameObservable('items', entry.piece.itemId).pipe(
            switchMap(name => {
              return safeCombineLatest(entry.piece.materias.filter(m => m > 0).map(materia => {
                return this.i18n.getNameObservable('items', materia);
              })).pipe(
                map(materias => {
                  return { entry, name, materias };
                })
              );
            })
          );
        })
    ).pipe(
      map(entriesWithNames => {
        return entriesWithNames.reduce((acc, { entry, name, materias }) => {
          acc += `**${name}${entry.piece.hq ? ' ' + this.translate.instant('COMMON.Hq') : ''}**
        ${materias.reduce((materiaStr, materia) => {
            return `${materiaStr}\n- ${materia}`;
          }, '')}\n\n`;
          return acc;
        }, '');
      })
    );
  }

  updateProgression(key: string, progression: GearsetProgression): void {
    this.gearsetsFacade.saveProgression(key, { ...progression });
  }


}
