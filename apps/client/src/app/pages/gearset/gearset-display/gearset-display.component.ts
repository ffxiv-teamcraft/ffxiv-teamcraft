import { Component } from '@angular/core';
import { BehaviorSubject, combineLatest, concat, Observable, of } from 'rxjs';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { GearsetsFacade } from '../../../modules/gearsets/+state/gearsets.facade';
import { filter, first, map, mergeMap, takeUntil, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { StatsService } from '../../../modules/gearsets/stats.service';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { NzModalService, NzNotificationService } from 'ng-zorro-antd';
import { GearsetComparatorPopupComponent } from '../../../modules/gearsets/gearset-comparator-popup/gearset-comparator-popup.component';
import { MateriaService } from '../../../modules/gearsets/materia.service';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { List } from '../../../modules/list/model/list';

@Component({
  selector: 'app-gearset-display',
  templateUrl: './gearset-display.component.html',
  styleUrls: ['./gearset-display.component.less']
})
export class GearsetDisplayComponent extends TeamcraftComponent {

  public gearset$: Observable<TeamcraftGearset> = this.gearsetsFacade.selectedGearset$;

  public gearsetSlotProperties: (keyof TeamcraftGearset)[][] = [
    ['mainHand', 'offHand'],
    ['head', 'necklace'],
    ['chest', 'earRings'],
    ['gloves', 'bracelet'],
    ['belt', 'ring1'],
    ['legs', 'ring2'],
    ['feet', 'crystal']
  ];


  public level$ = new BehaviorSubject<number>(80);

  public tribe$ = new BehaviorSubject<number>(1);

  public stats$: Observable<{ id: number, value: number }[]> = combineLatest([this.gearsetsFacade.selectedGearset$, this.level$, this.tribe$]).pipe(
    map(([set, level, tribe]) => {
      return this.statsService.getStats(set, level, tribe);
    })
  );

  tribesMenu = this.gearsetsFacade.tribesMenu;

  maxLevel = environment.maxLevel;

  permissionLevel$: Observable<PermissionLevel> = this.gearsetsFacade.selectedGearsetPermissionLevel$;

  constructor(private gearsetsFacade: GearsetsFacade, private activatedRoute: ActivatedRoute,
              public translate: TranslateService, private statsService: StatsService,
              private dialog: NzModalService, private materiaService: MateriaService,
              private listPicker: ListPickerService, private listManager: ListManagerService,
              private listsFacade: ListsFacade, private progressService: ProgressPopupService,
              private notificationService: NzNotificationService, private lazyData: LazyDataService,
              private router: Router) {
    super();
    this.activatedRoute.paramMap
      .pipe(
        map(params => params.get('setId')),
        tap((setId: string) => this.gearsetsFacade.load(setId)),
        takeUntil(this.onDestroy$)
      )
      .subscribe(setId => {
        this.gearsetsFacade.select(setId);
      });
  }

  compare(gearset: TeamcraftGearset): void {
    this.dialog.create({
      nzTitle: this.translate.instant('GEARSETS.COMPARISON.Compare_popup_title', { setName: gearset.name }),
      nzContent: GearsetComparatorPopupComponent,
      nzComponentParams: {
        gearset: gearset
      },
      nzFooter: null
    });
  }

  generateList(gearset: TeamcraftGearset): void {
    const items = this.gearsetsFacade.toArray(gearset).map(piece => {
      return {
        id: piece.itemId,
        amount: 1
      };
    });
    items.push(...this.materiaService.getTotalNeededMaterias(gearset));
    this.listPicker.pickList().pipe(
      mergeMap(list => {
        const operations = items.map(item => {
          const recipe = this.lazyData.data.recipes.find(r => r.result === item.id);
          return this.listManager.addToList(+item.id, list, recipe ? recipe.id : '', item.amount);
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
          { amount: items.length, listname: list.name });
      }),
      tap(list => list.$key ? this.listsFacade.updateList(list) : this.listsFacade.addList(list)),
      mergeMap(list => {
        // We want to get the list created before calling it a success, let's be pessimistic !
        return this.progressService.showProgress(
          combineLatest([this.listsFacade.myLists$, this.listsFacade.listsWithWriteAccess$]).pipe(
            map(([myLists, listsICanWrite]) => [...myLists, ...listsICanWrite]),
            map(lists => lists.find(l => l.createdAt.toMillis() === list.createdAt.toMillis())),
            filter(l => l !== undefined),
            first()
          ), 1, 'Saving_in_database');
      })
    ).subscribe((list: List) => {
      this.notificationService.success(
        this.translate.instant('Success'),
        this.translate.instant('Recipes_Added', { itemcount: items.length, listname: list.name })
      );
      this.router.navigate(['/list', list.$key]);
    });
  }

}
