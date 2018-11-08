import { Component } from '@angular/core';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { List } from '../../../modules/list/model/list';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { filter, first, map, switchMap, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-merge-lists-popup',
  templateUrl: './merge-lists-popup.component.html',
  styleUrls: ['./merge-lists-popup.component.less']
})
export class MergeListsPopupComponent {

  lists$ = this.listsFacade.myLists$;

  selectedLists: List[] = [];

  constructor(private listsFacade: ListsFacade, private progressService: ProgressPopupService,
              private modalRef: NzModalRef, private message: NzMessageService,
              private translate: TranslateService) {
  }

  public setSelection(list: List, selected: boolean): void {
    if (selected) {
      this.selectedLists.push(list);
    } else {
      this.selectedLists = this.selectedLists.filter(l => l.$key !== list.$key);
    }
  }

  public merge(): void {
    this.selectedLists.forEach(list => this.listsFacade.load(list.$key));
    this.listsFacade.newList().pipe(
      switchMap(list => {
        return this.listsFacade.allListDetails$.pipe(
          filter(listsDetails => {
            return this.selectedLists.reduce((res, l) => res && listsDetails.find(ld => ld.$key === l.$key) !== undefined, true);
          }),
          first(),
          map(() => list)
        );
      }),
      map(resultList => {
        this.selectedLists.forEach(list => resultList.merge(list));
        return resultList;
      }),
      tap(resultList => this.listsFacade.updateList(resultList)),
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
