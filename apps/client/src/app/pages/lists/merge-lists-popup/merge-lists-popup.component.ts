import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { List } from '../../../modules/list/model/list';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { filter, first, map, skip, switchMap, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { concat, Observable } from 'rxjs';
import { WorkshopDisplay } from '../../../model/other/workshop-display';
import { WorkshopsFacade } from '../../../modules/workshop/+state/workshops.facade';
import { AbstractListsSelectionPopup } from '../abstract-lists-selection-popup';
import { ListController } from '../../../modules/list/list-controller';

@Component({
  selector: 'app-merge-lists-popup',
  templateUrl: './merge-lists-popup.component.html',
  styleUrls: ['./merge-lists-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MergeListsPopupComponent extends AbstractListsSelectionPopup {

  merging = false;

  deleteAfter = false;

  constructor(listsFacade: ListsFacade, private progressService: ProgressPopupService,
              private modalRef: NzModalRef, private message: NzMessageService,
              private translate: TranslateService, workshopsFacade: WorkshopsFacade) {
    super(listsFacade, workshopsFacade);
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
          lists.forEach(list => ListController.merge(resultList, list));
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
