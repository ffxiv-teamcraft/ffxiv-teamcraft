import { Component } from '@angular/core';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { List } from '../../../modules/list/model/list';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { debounceTime, filter, first, map, mergeMap, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { NameQuestionPopupComponent } from '../../../modules/name-question-popup/name-question-popup/name-question-popup.component';
import { Workshop } from '../../../model/other/workshop';
import { WorkshopsFacade } from '../../../modules/workshop/+state/workshops.facade';
import { WorkshopDisplay } from '../../../model/other/workshop-display';
import { TeamsFacade } from '../../../modules/teams/+state/teams.facade';
import { Team } from '../../../model/team/team';
import { MergeListsPopupComponent } from '../merge-lists-popup/merge-lists-popup.component';
import { ListImportPopupComponent } from '../list-import-popup/list-import-popup.component';
import { AuthFacade } from '../../../+state/auth.facade';
import { DeleteMultipleListsPopupComponent } from '../delete-multiple-lists-popup/delete-multiple-lists-popup.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.less']
})
export class ListsComponent {

  public lists$: Observable<{ communityLists: List[], otherLists: List[] }>;

  public teamsDisplays$: Observable<{ team: Team, lists: List[] }[]>;

  public sharedLists$: Observable<List[]>;

  public favoriteLists$: Observable<List[]>;

  public workshops$: Observable<WorkshopDisplay[]>;

  public sharedWorkshops$: Observable<WorkshopDisplay[]>;

  public query$ = new BehaviorSubject<string>('');

  public myLists$ = this.listsFacade.myLists$.pipe(debounceTime(50));

  public loading$: Observable<boolean>;

  public needsVerification$ = this.listsFacade.needsVerification$;

  private loadingLists = [];

  constructor(private listsFacade: ListsFacade, private progress: ProgressPopupService,
              private listManager: ListManagerService, private message: NzMessageService,
              private translate: TranslateService, private dialog: NzModalService,
              private workshopsFacade: WorkshopsFacade, private teamsFacade: TeamsFacade,
              private authFacade: AuthFacade) {
    this.listsFacade.loadMyLists();
    this.listsFacade.loadListsWithWriteAccess();
    this.workshopsFacade.loadMyWorkshops();
    this.workshopsFacade.loadWorkshopsWithWriteAccess();
    this.teamsFacade.loadMyTeams();

    this.workshops$ = combineLatest([this.workshopsFacade.myWorkshops$, this.listsFacade.allListDetails$]).pipe(
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

    this.favoriteLists$ = this.authFacade.favorites$.pipe(
      filter(favorites => favorites !== undefined),
      map(favorites => (favorites.lists || [])),
      tap(lists => lists.forEach(list => this.listsFacade.load(list))),
      mergeMap(lists => {
        return this.listsFacade.allListDetails$.pipe(
          map(compacts => compacts.filter(c => lists.indexOf(c.$key) > -1 && !c.notFound))
        );
      })
    );

    this.sharedWorkshops$ = combineLatest([this.workshopsFacade.sharedWorkshops$, this.listsFacade.allListDetails$]).pipe(
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

    this.teamsDisplays$ = this.teamsFacade.myTeams$.pipe(
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

    this.lists$ = combineLatest([this.listsFacade.loadingMyLists$, this.listsFacade.myLists$, this.workshops$, this.sharedWorkshops$, this.teamsDisplays$, this.query$]).pipe(
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
    this.sharedLists$ = combineLatest([this.listsFacade.sharedLists$, this.workshopsFacade.sharedWorkshops$]).pipe(
      debounceTime(100),
      map(([lists, workshops]) => {
        return lists.filter(l => !workshops.some(w => w.listIds.some(id => id === l.$key)));
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.loading$ = combineLatest([this.lists$, this.workshops$, this.sharedWorkshops$, this.teamsDisplays$]).pipe(
      map(() => false),
      startWith(true)
    );

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

  trackByList(index: number, list: List): string {
    return list.$key;
  }

  trackByTeam(index: number, team: Team): string {
    return team.$key;
  }
}
