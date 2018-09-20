import { Component, OnInit } from '@angular/core';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { TranslateService } from '@ngx-translate/core';
import { NzModalService } from 'ng-zorro-antd';
import { NameQuestionPopupComponent } from '../../../modules/name-question-popup/name-question-popup/name-question-popup.component';
import { filter } from 'rxjs/operators';
import { List } from '../../../modules/list/model/list';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.less']
})
export class ListsComponent implements OnInit {

  public lists$ = this.listsFacade.allLists$;

  public loading$ = this.listsFacade.loading$;

  constructor(private listsFacade: ListsFacade, private translate: TranslateService,
              private dialog: NzModalService) {
  }

  ngOnInit(): void {
    this.listsFacade.loadAll();
  }

  createList(): void {
    this.dialog.create({
      nzContent: NameQuestionPopupComponent,
      nzFooter: null,
      nzTitle: this.translate.instant('New_List')
    }).afterClose.pipe(
      filter(name => name !== undefined)
    ).subscribe(name => this.listsFacade.createEmptyList(name));
  }

  trackByList(index: number, list: List): string {
    return list.$key;
  }
}
