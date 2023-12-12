import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { List } from '../../../modules/list/model/list';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { debounceTime, filter, first, map, mergeMap, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import {
  NameQuestionPopupComponent
} from '../../../modules/name-question-popup/name-question-popup/name-question-popup.component';
import { Workshop } from '../../../model/other/workshop';
import { WorkshopsFacade } from '../../../modules/workshop/+state/workshops.facade';
import { WorkshopDisplay } from '../../../model/other/workshop-display';
import { TeamsFacade } from '../../../modules/teams/+state/teams.facade';
import { Team } from '../../../model/team/team';
import { MergeListsPopupComponent } from '../merge-lists-popup/merge-lists-popup.component';
import { ListImportPopupComponent } from '../list-import-popup/list-import-popup.component';
import { AuthFacade } from '../../../+state/auth.facade';
import {
  DeleteMultipleListsPopupComponent
} from '../delete-multiple-lists-popup/delete-multiple-lists-popup.component';
import { CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { ListAggregate } from '../../../modules/list-aggregate/model/list-aggregate';
import { ListAggregatesFacade } from '../../../modules/list-aggregate/+state/list-aggregates.facade';
import { LayoutsFacade } from '../../../core/layout/+state/layouts.facade';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';
import { TeamcraftLinkPipe } from '../../../pipes/pipes/teamcraft-link.pipe';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { WorkshopPanelComponent } from '../../../modules/workshop/workshop-panel/workshop-panel.component';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { ClipboardDirective } from '../../../core/clipboard.directive';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { ListPanelComponent } from '../../../modules/list/list-panel/list-panel.component';
import { NgForTrackByKeyDirective } from '../../../core/track-by/ng-for-track-by-key.directive';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { FormsModule } from '@angular/forms';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { RouterLink } from '@angular/router';
import { TutorialStepDirective } from '../../../core/tutorial/tutorial-step.directive';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-lists',
    templateUrl: './lists.component.html',
    styleUrls: ['./lists.component.less'],
    standalone: true,
    imports: [NgIf, PageLoaderComponent, FlexModule, NzButtonModule, NzWaveModule, NzToolTipModule, NzIconModule, TutorialStepDirective, RouterLink, NzSwitchModule, FormsModule, NzAlertModule, NzInputModule, NzDividerModule, NgFor, NgForTrackByKeyDirective, ListPanelComponent, CdkDropList, CdkDrag, NzEmptyModule, NzListModule, NzTagModule, ClipboardDirective, NzPopconfirmModule, WorkshopPanelComponent, NzCollapseModule, AsyncPipe, TranslateModule, TeamcraftLinkPipe]
})
export class ListsComponent {

  public teamsDisplays$: Observable<{ team: Team, lists: List[] }[]> = this.teamsFacade.myTeams$.pipe(
    switchMap(teams => {
      if (teams.length === 0) {
        return of([]);
      }
      teams.forEach(team => {
        this.listsFacade.loadTeamLists(team.$key);
      });
      return combineLatest(teams.map(team => this.listsFacade.getTeamLists(team).pipe(
        map(lists => {
          return { team: team, lists: this.listsFacade.sortLists(lists) };
        })
      )));
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public sharedLists$: Observable<List[]> = combineLatest([this.listsFacade.sharedLists$, this.workshopsFacade.sharedWorkshops$]).pipe(
    debounceTime(100),
    map(([lists, workshops]) => {
      return lists.filter(l => !workshops.some(w => w.listIds.some(id => id === l.$key)));
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public favoriteLists$: Observable<List[]> = this.authFacade.favorites$.pipe(
    filter(favorites => favorites !== undefined),
    map(favorites => (favorites.lists || [])),
    tap(lists => lists.forEach(list => this.listsFacade.load(list))),
    mergeMap(lists => {
      return this.listsFacade.allListDetails$.pipe(
        map(compacts => compacts.filter(c => lists.indexOf(c.$key) > -1 && !c.notFound))
      );
    })
  );

  public workshops$: Observable<WorkshopDisplay[]> = combineLatest([this.workshopsFacade.myWorkshops$, this.listsFacade.allListDetails$]).pipe(
    debounceTime(100),
    map(([workshops, lists]) => {
      return workshops
        .map(workshop => {
          return {
            workshop: workshop,
            lists: workshop.listIds
              .map(key => {
                const list = lists.find(c => c.$key === key);
                if (list !== undefined) {
                  list.workshopId = workshop.$key;
                }
                return list;
              })
              .filter(l => l !== undefined)
          };
        })
        .sort((a, b) => a.workshop.index - b.workshop.index);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public aggregates$: Observable<{ listNames: string, layoutName: string, aggregate: ListAggregate }[]> = this.listAggregatesFacade.allListAggregates$.pipe(
    switchMap(aggregates => {
      return combineLatest(aggregates.map(aggregate => {
        aggregate.lists.forEach(id => this.listsFacade.load(id));
        if (!aggregate.layout.startsWith('default') && !aggregate.layout.startsWith('venili')) {
          this.layoutsFacade.load(aggregate.layout);
        }
        return safeCombineLatest([
          this.listsFacade.allListDetails$,
          this.layoutsFacade.allLayouts$
        ]).pipe(
          map(([details, layouts]) => {
            return {
              layoutName: layouts.find(l => l.$key === aggregate.layout)?.name,
              listNames: details.filter(list => aggregate.lists.includes(list.$key)).map(l => l.name).join(', '),
              aggregate
            };
          })
        );
      }));
    })
  );

  public sharedWorkshops$: Observable<WorkshopDisplay[]> = combineLatest([this.workshopsFacade.sharedWorkshops$, this.listsFacade.allListDetails$]).pipe(
    debounceTime(100),
    map(([workshops, lists]) => {
      return workshops
        .map(workshop => {
          return {
            workshop: workshop,
            lists: workshop.listIds
              .map(key => {
                const list = lists.find(c => c.$key === key);
                if (list !== undefined) {
                  list.workshopId = workshop.$key;
                } else if (!this.loadingLists.includes(key)) {
                  this.loadingLists.push(key);
                  this.listsFacade.load(key);
                }
                return list;
              })
              .filter(l => l !== undefined)
          };
        });
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public query$ = new BehaviorSubject<string>('');

  public lists$: Observable<{ communityLists: List[], otherLists: List[] }> = combineLatest([this.listsFacade.loadingMyLists$, this.listsFacade.myLists$, this.workshops$, this.sharedWorkshops$, this.teamsDisplays$, this.query$]).pipe(
    filter(([loading]) => !loading),
    debounceTime(100),
    map(([, lists, myWorkshops, workshopsWithWriteAccess, teamDisplays, query]: [boolean, List[], WorkshopDisplay[], WorkshopDisplay[], any[], string]) => {
      const workshops = [...myWorkshops, ...workshopsWithWriteAccess];
      // lists category shows only lists that have no workshop.
      return lists
        .filter(l => {
          return workshops.find(w => w.workshop.listIds.indexOf(l.$key) > -1) === undefined
            && teamDisplays.find(td => td.lists.find(tl => tl.$key === l.$key) !== undefined) === undefined;
        })
        .filter(l => !l.notFound && l.name !== undefined && l.name.toLowerCase().indexOf((query || '').toLowerCase()) > -1)
        .map(l => {
          delete l.workshopId;
          return l;
        });
    }),
    map(lists => this.listsFacade.sortLists(lists)),
    map(lists => {
      return {
        communityLists: lists.filter(l => l.public),
        otherLists: lists.filter(l => !l.public)
      };
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public archivedListsLoaded$ = this.listsFacade.allListDetails$.pipe(
    map(lists => lists.some(l => l.archived))
  );

  public myLists$ = this.listsFacade.myLists$.pipe(debounceTime(50));

  public loading$: Observable<boolean> = combineLatest([this.lists$, this.workshops$, this.sharedWorkshops$, this.teamsDisplays$]).pipe(
    map(() => false),
    startWith(true)
  );

  public needsVerification$ = this.listsFacade.needsVerification$;

  private loadingLists = [];

  constructor(private listsFacade: ListsFacade,
              private translate: TranslateService, private dialog: NzModalService,
              private workshopsFacade: WorkshopsFacade, private teamsFacade: TeamsFacade,
              private authFacade: AuthFacade, private listAggregatesFacade: ListAggregatesFacade,
              private layoutsFacade: LayoutsFacade) {
    this.listsFacade.loadMyLists();
    this.listsFacade.loadListsWithWriteAccess();
    this.workshopsFacade.loadMyWorkshops();
    this.workshopsFacade.loadWorkshopsWithWriteAccess();
    this.teamsFacade.loadMyTeams();
    this.layoutsFacade.loadAll();
    this.teamsFacade.loadMyTeams();
  }

  createList(): void {
    this.listsFacade.createEmptyList();
  }

  loadArchivedLists(): void {
    this.listsFacade.loadArchivedLists();
  }

  unLoadArchivedLists(): void {
    this.listsFacade.unLoadArchivedLists();
  }

  deleteMultipleLists(): void {
    this.dialog.create({
      nzTitle: this.translate.instant('LISTS.Delete_multiple_lists'),
      nzContent: DeleteMultipleListsPopupComponent,
      nzFooter: null
    });
  }

  createWorkshop(): void {
    this.dialog.create({
      nzContent: NameQuestionPopupComponent,
      nzFooter: null,
      nzTitle: this.translate.instant('WORKSHOP.Add_workshop')
    }).afterClose.pipe(
      filter(name => name !== undefined),
      map(name => {
        const workshop = new Workshop();
        workshop.name = name;
        return workshop;
      }),
      first()
    ).subscribe((workshop) => {
      this.workshopsFacade.createWorkshop(workshop);
    });
  }

  setListIndex(list: List, index: number, lists: List[]): void {
    if (list.workshopId !== undefined) {
      this.workshopsFacade.removeListFromWorkshop(list.$key, list.workshopId);
    }
    if (index === list.index) {
      return;
    }
    // Remove list from the array
    lists = lists.filter(l => l.$key !== list.$key);
    // Insert it at new index
    lists.splice(index, 0, list);
    // Update indexes and persist
    this.listsFacade.updateListIndexes(lists.map((l, i) => {
      if (l.index !== i) {
        l.index = i;
      }
      return l;
    }));
    inject(ChangeDetectorRef).markForCheck();
  }

  setWorkshopIndex(event: CdkDragDrop<WorkshopDisplay>, workshopDisplays: WorkshopDisplay[]): void {
    const root = workshopDisplays.map(d => d.workshop);
    moveItemInArray(root, event.previousIndex, event.currentIndex);
    root.forEach((row, i) => {
      row.index = i;
    });
    this.workshopsFacade.updateWorkshopIndexes(root);
  }

  openMergeDialog(): void {
    this.dialog.create({
      nzTitle: this.translate.instant('LISTS.Merge_lists'),
      nzContent: MergeListsPopupComponent,
      nzFooter: null
    });
  }

  importList(): void {
    this.dialog.create({
      nzTitle: this.translate.instant('LISTS.IMPORT.Title'),
      nzContent: ListImportPopupComponent,
      nzFooter: null
    });
  }

  deleteAggregate(aggregate: ListAggregate): void {
    return this.listAggregatesFacade.delete(aggregate.$key);
  }
}
