import { Component } from '@angular/core';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { List } from '../../../modules/list/model/list';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { debounceTime, filter, first, map, mergeMap, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
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
import { requestsWithDelay } from '../../../core/rxjs/requests-with-delay';

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

  private regenerating = false;

  public needsVerification$ = this.listsFacade.needsVerification$;

  constructor(private listsFacade: ListsFacade, private progress: ProgressPopupService,
              private listManager: ListManagerService, private message: NzMessageService,
              private translate: TranslateService, private dialog: NzModalService,
              private workshopsFacade: WorkshopsFacade, private teamsFacade: TeamsFacade,
              private authFacade: AuthFacade) {
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
      shareReplay(1)
    );

    this.favoriteLists$ = this.authFacade.favorites$.pipe(
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
                  }
                  return list;
                })
                .filter(l => l !== undefined)
            };
          });
      }),
      shareReplay(1)
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
      shareReplay(1)
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
      shareReplay(1)
    );
    this.sharedLists$ = combineLatest([this.listsFacade.sharedLists$, this.workshopsFacade.sharedWorkshops$]).pipe(
      debounceTime(100),
      map(([lists, workshops]) => {
        return lists.filter(l => !workshops.some(w => w.listIds.some(id => id === l.$key)));
      }),
      shareReplay(1)
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

  regenerateLists(compacts: List[]): void {
    this.regenerating = true;
    compacts.forEach(compact => {
      this.listsFacade.load(compact.$key);
    });

    const regenerations = compacts
      .filter(compact => compact.isOutDated())
      .map(compact => {
        return this.listsFacade.allListDetails$.pipe(
          map(details => details.find(l => l.$key === compact.$key)),
          filter(list => list !== undefined),
          first(),
          switchMap(list => this.listManager.upgradeList(list)),
          tap(l => this.listsFacade.updateList(l, false, true))
        );
      });

    this.progress.showProgress(requestsWithDelay(regenerations, 250, true), regenerations.length)
      .pipe(
        first(),
        switchMap(() => {
          return this.progress.showProgress(this.listsFacade.myLists$.pipe(
            filter(lists => {
              return lists.some(l => l.isOutDated()) === false;
            }),
            first()
          ), 1, 'Saving_in_database');
        })
      )
      .subscribe(() => {
        this.regenerating = false;
        this.message.success(this.translate.instant('LISTS.Regenerated_all'));
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
    lists
      .map((l, i) => {
        if (l.index !== i) {
          l.index = i;
        }
        return l;
      })
      .forEach(l => {
        this.listsFacade.updateListIndex(l);
      });
  }

  setWorkshopIndex(workshop: Workshop, index: number, workshopDisplays: WorkshopDisplay[]): void {
    // Remove workshop from the array
    const workshops = workshopDisplays
      .map(display => display.workshop)
      .filter(w => w.$key !== workshop.$key);
    // Insert it at new index
    workshops.splice(index, 0, workshop);
    // Update indexes and persist
    workshops
      .filter((w, i) => w.index !== i)
      .map((w, i) => {
        w.index = i;
        return w;
      })
      .forEach(w => {
        this.workshopsFacade.updateWorkshop(w);
      });
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
