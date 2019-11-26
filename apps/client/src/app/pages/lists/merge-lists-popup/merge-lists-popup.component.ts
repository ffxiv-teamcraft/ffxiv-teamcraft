import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { List } from '../../../modules/list/model/list';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { debounceTime, filter, first, map, skip, switchMap, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, concat, Observable } from 'rxjs';
import { WorkshopDisplay } from '../../../model/other/workshop-display';
import { WorkshopsFacade } from '../../../modules/workshop/+state/workshops.facade';

@Component({
  selector: 'app-merge-lists-popup',
  templateUrl: './merge-lists-popup.component.html',
  styleUrls: ['./merge-lists-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MergeListsPopupComponent implements OnInit {

  lists$: Observable<List[]>;

  workshops$: Observable<WorkshopDisplay[]>;

  selectedLists: List[] = [];

  merging = false;

  deleteAfter = false;

  constructor(private listsFacade: ListsFacade, private progressService: ProgressPopupService,
              private modalRef: NzModalRef, private message: NzMessageService,
              private translate: TranslateService, private workshopsFacade: WorkshopsFacade) {
  }

  public setSelection(list: List, selected: boolean): void {
    if (selected) {
      this.selectedLists.push(list);
      this.listsFacade.load(list.$key);
    } else {
      this.selectedLists = this.selectedLists.filter(l => l.$key !== list.$key);
    }
  }

  ngOnInit(): void {
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
                .filter(l => l !== undefined && l.name)
                .filter((l: List) => !l.isLarge())
            };
          })
          .filter(display => display.lists.length > 0)
          .sort((a, b) => a.workshop.index - b.workshop.index);
      })
    );
    this.lists$ = combineLatest([this.listsFacade.myLists$, this.workshops$]).pipe(
      debounceTime(100),
      map(([lists, workshops]) => {
        // lists category shows only lists that have no workshop.
        return lists
          .filter(l => {
            return workshops.find(w => w.workshop.listIds.indexOf(l.$key) > -1) === undefined;
          })
          .map(l => {
            delete l.workshopId;
            return l;
          });
      }),
      map(lists => {
        return lists.sort((a, b) => b.index - a.index).filter((l: List) => !l.isLarge() && l.name);
      })
    );
  }

  public merge(): void {
    concat(...this.selectedLists.map(list => this.listsFacade.loadAndWait(list.$key)))
      .pipe(
        skip(this.selectedLists.length - 1),
        switchMap(() => this.listsFacade.newList()),
        switchMap(list => {
          this.merging = true;
          return this.listsFacade.allListDetails$.pipe(
            filter(listsDetails => {
              return this.selectedLists.reduce((res, l) => res && listsDetails.find(ld => ld.$key === l.$key) !== undefined, true);
            }),
            first(),
            map((listsDetails) => [listsDetails.filter(ld => this.selectedLists.find(l => l.$key === ld.$key) !== undefined), list])
          );
        }),
        map(([lists, resultList]: [List[], List]) => {
          lists.forEach(list => resultList.merge(list));
          return resultList;
        }),
        tap(resultList => this.listsFacade.addList(resultList)),
        switchMap((list) => {
          return this.progressService.showProgress(this.listsFacade.myLists$.pipe(
            map(lists => lists.find(l => l.createdAt.toMillis() === list.createdAt.toMillis() && l.$key !== undefined)),
            filter(l => l !== undefined),
            first()
          ), 1, 'Saving_in_database');
        }),
        first(),
        tap(() => {
          if (this.deleteAfter) {
            this.selectedLists.forEach(list => {
              this.listsFacade.deleteList(list.$key, list.offline);
            });
          }
        })
      ).subscribe(() => {
      this.message.success(this.translate.instant('LISTS.Lists_merged'));
      this.modalRef.close();
    });
  }

}
