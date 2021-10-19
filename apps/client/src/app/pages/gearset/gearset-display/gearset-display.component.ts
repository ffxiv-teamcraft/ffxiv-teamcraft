import { Component } from '@angular/core';
import { BehaviorSubject, combineLatest, concat, Observable, of } from 'rxjs';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { GearsetsFacade } from '../../../modules/gearsets/+state/gearsets.facade';
import { first, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
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
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { List } from '../../../modules/list/model/list';
import { RecipeChoicePopupComponent } from '../../simulator/components/recipe-choice-popup/recipe-choice-popup.component';
import { BaseParam } from '../../../modules/gearsets/base-param';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { AuthFacade } from '../../../+state/auth.facade';
import { GearsetProgression } from '../../../model/gearset/gearset-progression';
import { Clipboard } from '@angular/cdk/clipboard';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CommissionsFacade } from '../../../modules/commission-board/+state/commissions.facade';

@Component({
  selector: 'app-gearset-display',
  templateUrl: './gearset-display.component.html',
  styleUrls: ['./gearset-display.component.less']
})
export class GearsetDisplayComponent extends TeamcraftComponent {

  public gearset$: Observable<TeamcraftGearset> = this.gearsetsFacade.selectedGearset$.pipe(
    tap(gearset => {
      if (gearset.food) {
        this.food$.next(gearset.food);
      }
    })
  );

  public progression$: Observable<GearsetProgression> = this.gearsetsFacade.selectedGearsetProgression$;

  public gearsetSlotProperties: (keyof TeamcraftGearset)[][] = [
    ['mainHand', 'offHand'],
    ['head', 'earRings'],
    ['chest', 'necklace'],
    ['gloves', 'bracelet'],
    ['belt', 'ring1'],
    ['legs', 'ring2'],
    ['feet', 'crystal']
  ];

  public level$ = new BehaviorSubject<number>(80);

  public tribe$ = new BehaviorSubject<number>(1);

  public food$ = new BehaviorSubject<any>(null);

  public stats$: Observable<{ id: number, value: number }[]> = combineLatest([this.gearsetsFacade.selectedGearset$, this.level$, this.tribe$, this.food$]).pipe(
    switchMap(([set, level, tribe, food]) => {
      return this.statsService.getStats(set, level, tribe, food);
    })
  );

  public foods$: Observable<any[]> = this.gearset$.pipe(
    first(),
    map(gearset => {
      const relevantStats = this.statsService.getRelevantBaseStats(gearset.job);
      return [].concat.apply([], this.lazyData.data.foods
        .filter(food => {
          return Object.values<any>(food.Bonuses).some(stat => relevantStats.indexOf(stat.ID) > -1);
        })
        .map(food => {
          return [{ ...food, HQ: false }, { ...food, HQ: true }];
        }));
    })
  );

  tribesMenu = this.gearsetsFacade.tribesMenu;

  maxLevel = environment.maxLevel;

  permissionLevel$: Observable<PermissionLevel> = this.gearsetsFacade.selectedGearsetPermissionLevel$;

  userId$: Observable<string> = this.authFacade.userId$;

  loggedIn$: Observable<boolean> = this.authFacade.loggedIn$;

  includeAllTools = localStorage.getItem('gearsets:include-all-tools') === 'true';

  constructor(private gearsetsFacade: GearsetsFacade, private activatedRoute: ActivatedRoute,
              public translate: TranslateService, private statsService: StatsService,
              private dialog: NzModalService, private materiaService: MateriaService,
              private listPicker: ListPickerService, private listManager: ListManagerService,
              private listsFacade: ListsFacade, private progressService: ProgressPopupService,
              private notificationService: NzNotificationService, private lazyData: LazyDataService,
              private router: Router, private i18n: I18nToolsService,
              private l12n: LocalizedDataService, private message: NzMessageService,
              private authFacade: AuthFacade, private clipboard: Clipboard,
              private afs: AngularFirestore, private commissionsFacade: CommissionsFacade) {
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
        this.dialog.create({
          nzFooter: null,
          nzContent: RecipeChoicePopupComponent,
          nzComponentParams: {
            statsStr: `${craftsmanship}/${control}/${cp}/${this.level$.value}/${1}`,
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

  createCommission(gearset: TeamcraftGearset, progression: GearsetProgression): void {
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
      const recipe = this.lazyData.data.recipes.find(r => r.result === item.id);
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
    this.progressService.showProgress(operation$,
      items.length,
      'Adding_recipes',
      { amount: items.length, listname: list.name })
      .pipe(
        switchMap(l => {
          return this.listsFacade.addListAndWait(l);
        })
      )
      .subscribe(resList => {
        this.commissionsFacade.create(resList);
      });
  }

  copyToClipboard(gearset: TeamcraftGearset): void {
    const res = this.clipboard.copy(this.getString(gearset));
    if (res) {
      this.message.success(this.translate.instant('GEARSETS.Copied_as_string'));
    }
  }

  getString(gearset: TeamcraftGearset): string {
    return this.gearsetsFacade.toArray(gearset)
      .filter(entry => entry.piece !== null)
      .reduce((acc, entry) => {
        acc += `**${this.i18n.getName(this.l12n.getItem(entry.piece.itemId))}${entry.piece.hq ? ' ' + this.translate.instant('COMMON.Hq') : ''}**
        ${entry.piece.materias.filter(m => m > 0).reduce((materiaStr, materia) => {
          return `${materiaStr}\n- ${this.i18n.getName(this.l12n.getItem(materia))}`;
        }, '')}\n\n`;
        return acc;
      }, '');
  }

  updateProgression(key: string, progression: GearsetProgression): void {
    this.gearsetsFacade.saveProgression(key, { ...progression });
  }


}
