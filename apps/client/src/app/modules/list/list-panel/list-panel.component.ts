import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { List } from '../model/list';
import { ListsFacade } from '../+state/lists.facade';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { LinkToolsService } from '../../../core/tools/link-tools.service';
import { ListRow } from '../model/list-row';
import { TagsPopupComponent } from '../tags-popup/tags-popup.component';
import { NameQuestionPopupComponent } from '../../name-question-popup/name-question-popup/name-question-popup.component';
import { filter, first, map } from 'rxjs/operators';
import { ListManagerService } from '../list-manager.service';

@Component({
  selector: 'app-list-panel',
  templateUrl: './list-panel.component.html',
  styleUrls: ['./list-panel.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListPanelComponent implements OnInit {

  @Input()
  list: List;

  constructor(private listsFacade: ListsFacade, private message: NzMessageService,
              private translate: TranslateService, private linkTools: LinkToolsService,
              private dialog: NzModalService, private listManager: ListManagerService) {
  }

  deleteList(list: List): void {
    this.listsFacade.deleteList(list.$key);
  }

  getLink(): string {
    return this.linkTools.getLink(`/list/${this.list.$key}`);
  }

  updateAmount(item: ListRow, newAmount: number): void {
    this.listManager.addToList(item.id, this.list, item.recipeId, newAmount - item.amount).pipe(
      first()
    ).subscribe(list => {
      this.listsFacade.updateList(list);
    });
  }

  renameList(list: List): void {
    this.dialog.create({
      nzContent: NameQuestionPopupComponent,
      nzComponentParams: { baseName: list.name },
      nzFooter: null,
      nzTitle: this.translate.instant('Edit')
    }).afterClose.pipe(
      filter(name => name !== undefined),
      map(name => {
        list.name = name;
        return list;
      })
    ).subscribe(l => this.listsFacade.updateList(l));
  }

  afterLinkCopy(): void {
    this.message.success(this.translate.instant('Share_link_copied'));
  }

  openTagsPopup(list: List): void {
    this.dialog.create({
      nzTitle: this.translate.instant('LIST_DETAILS.Tags_popup'),
      nzFooter: null,
      nzContent: TagsPopupComponent,
      nzComponentParams: { list: list }
    });
  }

  ngOnInit() {
  }

}
