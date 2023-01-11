import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { WorkshopsFacade } from '../../../modules/workshop/+state/workshops.facade';
import { TeamsFacade } from '../../../modules/teams/+state/teams.facade';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { LayoutsFacade } from '../../../core/layout/+state/layouts.facade';
import { List } from '../../../modules/list/model/list';

@Component({
  selector: 'app-list-aggregate-home',
  templateUrl: './list-aggregate-home.component.html',
  styleUrls: ['./list-aggregate-home.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListAggregateHomeComponent {

  public lists$ = this.listsFacade.allListDetails$.pipe(
    map(lists => {
      return lists.map(list => {
        return {
          list,
          checked: false
        };
      }).sort((a, b) => {
        return a.list.$key.localeCompare(b.list.$key);
      });
    }),
    distinctUntilChanged((a, b) => a.length === b.length)
  );

  public layoutId = 'defaultLayout';

  public selectedLists: List[] = [];

  public layouts$ = this.layoutsFacade.allLayouts$;

  public get currentLink(): string {
    return `${this.selectedLists.map(list => list.$key).join(':')}/${this.layoutId}`;
  }

  constructor(private listsFacade: ListsFacade, private workshopsFacade: WorkshopsFacade, private teamsFacade: TeamsFacade,
              private layoutsFacade: LayoutsFacade) {
    this.listsFacade.loadMyLists();
    this.listsFacade.loadListsWithWriteAccess();
    this.workshopsFacade.loadMyWorkshops();
    this.workshopsFacade.loadWorkshopsWithWriteAccess();
    this.teamsFacade.loadMyTeams();
    this.layoutsFacade.loadAll();
  }

  selectList(list: List, selected: boolean): void {
    if (selected) {
      this.selectedLists.push(list);
    } else {
      this.selectedLists = this.selectedLists.filter(l => l.$key !== list.$key);
    }
  }

  trackByTableRow(index: number, row: { list: List, checked: boolean }): string {
    return row.list.$key;
  }

}
