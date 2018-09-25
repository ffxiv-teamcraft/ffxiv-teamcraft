import { Component, Input, OnInit } from '@angular/core';
import { List } from '../model/list';
import { ListsFacade } from '../+state/lists.facade';
import { NzMessageService, NzNotificationService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { LinkToolsService } from '../../../core/tools/link-tools.service';

@Component({
  selector: 'app-list-panel',
  templateUrl: './list-panel.component.html',
  styleUrls: ['./list-panel.component.less']
})
export class ListPanelComponent implements OnInit {

  @Input()
  list: List;

  constructor(private listsFacade: ListsFacade, private message: NzMessageService,
              private translate: TranslateService, private linkTools: LinkToolsService) {
  }

  deleteList(list: List): void {
    this.listsFacade.deleteList(list.$key);
  }

  public getLink(): string {
    return this.linkTools.getLink(`/list/${this.list.$key}`);
  }

  afterLinkCopy(): void {
    this.message.success(this.translate.instant('Share_link_copied'));
  }

  ngOnInit() {
  }

}
