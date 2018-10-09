import { Component } from '@angular/core';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { List } from '../../../modules/list/model/list';
import { concat, Observable } from 'rxjs';
import { debounceTime, first, map } from 'rxjs/operators';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { NzMessageService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.less']
})
export class ListsComponent {

  public lists$: Observable<List[]>;

  public loading$: Observable<boolean>;

  constructor(private listsFacade: ListsFacade, private progress: ProgressPopupService,
              private listManager: ListManagerService, private message: NzMessageService,
              private translate: TranslateService) {
    this.lists$ = this.listsFacade.myLists$.pipe(
      debounceTime(100)
    );
    this.loading$ = this.listsFacade.loadingMyLists$;
  }

  createList(): void {
    this.listsFacade.createEmptyList();
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
