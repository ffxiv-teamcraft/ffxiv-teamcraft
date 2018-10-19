import { Component } from '@angular/core';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { List } from '../../../modules/list/model/list';
import { combineLatest, concat, Observable } from 'rxjs';
import { debounceTime, filter, first, map } from 'rxjs/operators';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { NameQuestionPopupComponent } from '../../../modules/name-question-popup/name-question-popup/name-question-popup.component';
import { Workshop } from '../../../model/other/workshop';
import { WorkshopsFacade } from '../../../modules/workshop/+state/workshops.facade';
import { WorkshopDisplay } from '../../../model/other/workshop-display';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.less']
})
export class ListsComponent {

  public lists$: Observable<List[]>;

  public listsWithWriteAccess$: Observable<List[]>;

  public workshops$: Observable<WorkshopDisplay[]>;

  public workshopsWithWriteAccess$: Observable<WorkshopDisplay[]>;

  public loading$: Observable<boolean>;

  constructor(private listsFacade: ListsFacade, private progress: ProgressPopupService,
              private listManager: ListManagerService, private message: NzMessageService,
              private translate: TranslateService, private dialog: NzModalService,
              private workshopsFacade: WorkshopsFacade) {
    this.workshops$ = combineLatest(this.workshopsFacade.myWorkshops$, this.listsFacade.compacts$).pipe(
      debounceTime(100),
      map(([workshops, compacts]) => {
        return workshops.map(workshop => {
          return {
            workshop: workshop,
            lists: workshop.listIds.map(key => {
              const list = compacts.find(c => c.$key === key);
              if (list !== undefined) {
                list.workshopId = workshop.$key;
              }
              return list;
            })
          };
        });
      })
    );

    // this.workshopsWithWriteAccess$ = this.workshopsFacade.workshopsWithWriteAccess$.pipe(
    //   debounceTime(100)
    // );

    this.lists$ = combineLatest(this.listsFacade.myLists$, this.workshops$).pipe(
      debounceTime(100),
      map(([lists, workshops]) => {
        // lists category shows only lists that have no workshop.
        return lists
          .filter(l => workshops.find(w => w.workshop.listIds.indexOf(l.$key) > -1) === undefined)
          .map(l => {
            delete l.workshopId;
            return l;
          });
      })
    );
    this.listsWithWriteAccess$ = this.listsFacade.listsWithWriteAccess$.pipe(
      debounceTime(100)
    );
    this.loading$ = this.listsFacade.loadingMyLists$;
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

  regenerateLists(lists: List[]): void {
    const regenerations = lists.map(list => {
      return this.listManager.upgradeList(list)
        .pipe(
          map(l => this.listsFacade.updateList(l))
        );
    });

    this.progress.showProgress(concat(...regenerations), regenerations.length).pipe(first()).subscribe(() => {
      this.message.success(this.translate.instant('LISTS.Regenerated_all'));
    });
  }

  setListIndex(list: List, index: number, lists: List[]): void {
    if (list.workshopId !== undefined) {
      this.workshopsFacade.removeListFromWorkshop(list.$key, list.workshopId);
    }
    // Remove list from the array
    lists = lists.filter(l => l.$key !== list.$key);
    // Insert it at new index
    lists.splice(index, 0, list);
    // Update indexes and persist
    lists
      .filter((l, i) => l.index !== i)
      .map((l, i) => {
        l.index = i;
        return l;
      })
      .forEach(l => {
        this.listsFacade.updateListIndex(l);
      });

  }

  trackByList(index: number, list: List): string {
    return list.$key;
  }
}
