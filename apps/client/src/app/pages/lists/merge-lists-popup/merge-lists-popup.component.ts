import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { List } from '../../../modules/list/model/list';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { filter, first, map, skip, switchMap, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { concat } from 'rxjs';

@Component({
  selector: 'app-merge-lists-popup',
  templateUrl: './merge-lists-popup.component.html',
  styleUrls: ['./merge-lists-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MergeListsPopupComponent {

  lists$ = this.listsFacade.myLists$;

  selectedLists: List[] = [];

  merging = false;

  constructor(private listsFacade: ListsFacade, private progressService: ProgressPopupService,
              private modalRef: NzModalRef, private message: NzMessageService,
              private translate: TranslateService) {
  }

  public setSelection(list: List, selected: true): void {
    if (selected) {
      this.selectedLists.push(list);
      this.listsFacade.load(list.$key);
    } else {
      this.selectedLists = this.selectedLists.filter(l => l.$key !== list.$key);
    }
  }

  public merge(): void {
    this.merging = true;
    concat(...this.selectedLists.map(list => this.listsFacade.loadAndWait(list.$key)))
      .pipe(
        skip(this.selectedLists.length - 1),
        switchMap(() => this.listsFacade.newList()),
        switchMap(list => {
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
            map(lists => lists.find(l => l.createdAt === list.createdAt && l.$key !== undefined)),
            filter(l => l !== undefined),
            first()
          ), 1, 'Saving_in_database');
        }),
        first()
      ).subscribe(() => {
      this.message.success(this.translate.instant('LISTS.Lists_merged'));
      this.modalRef.close();
    });
  }

}
