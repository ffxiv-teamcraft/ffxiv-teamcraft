import { Component, inject } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { List } from '../../list/model/list';
import { ListsFacade } from '../../list/+state/lists.facade';
import { NZ_DRAWER_DATA, NzDrawerRef } from 'ng-zorro-antd/drawer';
import { WorkshopDisplay } from '../../../model/other/workshop-display';
import { debounceTime, filter, first, map, shareReplay } from 'rxjs/operators';
import { WorkshopsFacade } from '../../workshop/+state/workshops.facade';
import { TeamsFacade } from '../../teams/+state/teams.facade';
import { ListController } from '../../list/list-controller';
import { TranslateModule } from '@ngx-translate/core';
import { NzListModule } from 'ng-zorro-antd/list';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-list-picker-drawer',
    templateUrl: './list-picker-drawer.component.html',
    styleUrls: ['./list-picker-drawer.component.less'],
    standalone: true,
    imports: [NgIf, NzButtonModule, NzWaveModule, NzIconModule, NzDividerModule, NzInputModule, FormsModule, NzListModule, NgFor, AsyncPipe, TranslateModule]
})
export class ListPickerDrawerComponent {

  listsWithWriteAccess$: Observable<List[]>;

  workshops$: Observable<WorkshopDisplay[]>;

  lists$: Observable<{ communityLists: List[], otherLists: List[] }>;

  query$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  workshopView: boolean = inject(NZ_DRAWER_DATA)?.workshopView;

  constructor(private listsFacade: ListsFacade, private drawerRef: NzDrawerRef<List>,
              private workshopsFacade: WorkshopsFacade, private teamsFacade: TeamsFacade) {

    this.listsFacade.loadMyLists();
    this.listsFacade.loadListsWithWriteAccess();
    this.workshopsFacade.loadMyWorkshops();
    this.workshopsFacade.loadWorkshopsWithWriteAccess();
    this.teamsFacade.loadMyTeams();
    this.teamsFacade.allTeams$.pipe(
      filter(teams => teams.length > 0),
      first()
    ).subscribe(teams => {
      teams.forEach(team => this.listsFacade.loadTeamLists(team.$key));
    });

    this.listsWithWriteAccess$ = combineLatest([this.listsFacade.listsWithWriteAccess$, this.query$]).pipe(
      map(([lists, query]) => lists.filter(l => !l.notFound && !ListController.isTooLarge(l) && l.name !== undefined && l.name.toLowerCase().indexOf(query.toLowerCase()) > -1))
    );

    this.workshops$ = combineLatest([this.workshopsFacade.myWorkshops$, this.listsFacade.allListDetails$, this.query$]).pipe(
      debounceTime(100),
      map(([workshops, lists, query]) => {
        return workshops
          .map(workshop => {
            return {
              workshop: workshop,
              lists: workshop.listIds
                .map(key => {
                  const list = lists.find(c => c.$key === key);
                  if (list !== undefined) {
                    list.workshopId = workshop.$key;
                  } else {
                    this.listsFacade.load(key);
                  }
                  return list;
                })
                .filter(l => l !== undefined)
                .filter(l => !l.notFound && !l.archived && !ListController.isTooLarge(l) && l.name !== undefined && l.name.toLowerCase().indexOf((query || '').toLowerCase()) > -1)
            };
          })
          .sort((a, b) => a.workshop.index - b.workshop.index);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.lists$ = combineLatest([this.listsFacade.loadingMyLists$, this.listsFacade.myLists$, this.workshops$, this.query$]).pipe(
      filter(([loading]) => !loading),
      debounceTime(100),
      map(([, lists, workshops, query]: [boolean, List[], WorkshopDisplay[], string]) => {
        // lists category shows only lists that have no workshop.
        return lists
          .filter(l => {
            return !l.archived && workshops.find(w => w.workshop.listIds.indexOf(l.$key) > -1) === undefined;
          })
          .filter(l => !l.notFound && !ListController.isTooLarge(l) && l.name !== undefined && l.name.toLowerCase().indexOf(query.toLowerCase()) > -1)
          .map(l => {
            delete l.workshopId;
            return l;
          });
      }),
      map(lists => lists.sort((a, b) => a.index - b.index)),
      map(lists => {
        return {
          communityLists: lists.filter(l => l.public),
          otherLists: lists.filter(l => !l.public)
        };
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
    this.listsWithWriteAccess$ = this.listsFacade.listsWithWriteAccess$.pipe(
      debounceTime(100),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.listsFacade.loadMyLists();
    this.listsFacade.loadListsWithWriteAccess();
  }

  trackByWorkshopDisplay(index: number, workshopDisplay: WorkshopDisplay): string {
    return workshopDisplay.workshop.$key;
  }

  pickList(list: List): void {
    this.drawerRef.close(list);
  }

  pickNewList(): void {
    this.listsFacade.newList().subscribe(list => {
      this.drawerRef.close(list);
    });
  }

}
