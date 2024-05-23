import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { List } from '../../../modules/list/model/list';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { filter, first, map, skip, switchMap, tap } from 'rxjs/operators';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { concat } from 'rxjs';
import { WorkshopsFacade } from '../../../modules/workshop/+state/workshops.facade';
import { AbstractListsSelectionPopupComponent } from '../abstract-lists-selection-popup.component';
import { ListController } from '../../../modules/list/list-controller';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzListModule } from 'ng-zorro-antd/list';
import { FormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgTemplateOutlet, AsyncPipe, UpperCasePipe } from '@angular/common';
import { NzAlertModule } from 'ng-zorro-antd/alert';

@Component({
    selector: 'app-merge-lists-popup',
    templateUrl: './merge-lists-popup.component.html',
    styleUrls: ['./merge-lists-popup.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzAlertModule, NgTemplateOutlet, FlexModule, NzButtonModule, NzWaveModule, NzCheckboxModule, FormsModule, NzListModule, NzTagModule, NzToolTipModule, AsyncPipe, UpperCasePipe, TranslateModule]
})
export class MergeListsPopupComponent extends AbstractListsSelectionPopupComponent {

  merging = false;

  deleteAfter = false;

  ListController = ListController;

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
            map(lists => lists.find(l => l.createdAt.seconds === list.createdAt.seconds && l.$key !== undefined)),
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
