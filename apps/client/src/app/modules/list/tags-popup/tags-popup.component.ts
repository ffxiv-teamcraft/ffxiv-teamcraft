import { Component, Input, OnInit } from '@angular/core';
import { List } from '../model/list';
import { ListTag } from '../model/list-tag.enum';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ListsFacade } from '../+state/lists.facade';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ListController } from '../list-controller';
import { TranslateModule } from '@ngx-translate/core';
import { PageLoaderComponent } from '../../page-loader/page-loader/page-loader.component';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-tags-popup',
    templateUrl: './tags-popup.component.html',
    styleUrls: ['./tags-popup.component.less'],
    standalone: true,
    imports: [NgIf, FlexModule, NzSelectModule, FormsModule, NgFor, NzButtonModule, NzWaveModule, PageLoaderComponent, AsyncPipe, TranslateModule]
})
export class TagsPopupComponent implements OnInit {

  @Input()
  list: Partial<List>;

  public list$: Observable<List>;

  tags: any[] = [];

  constructor(private modalRef: NzModalRef, private listsFacade: ListsFacade) {
  }

  confirm(list: List): void {
    ListController.updateEtag(list);
    this.listsFacade.updateList(list, true);
    this.modalRef.close();
  }

  cancel(): void {
    this.modalRef.close();
  }

  ngOnInit(): void {
    this.list$ = this.listsFacade.allListDetails$.pipe(
      map(lists => lists.find(l => l.$key === this.list.$key)),
      filter(list => list !== undefined)
    );
    this.tags = Object.keys(ListTag).map(key => {
      return {
        value: key,
        label: `LIST_TAGS.${key}`
      };
    });
  }

}
