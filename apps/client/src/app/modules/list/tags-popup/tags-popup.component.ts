import { Component, Input, OnInit } from '@angular/core';
import { List } from '../model/list';
import { ListTag } from '../model/list-tag.enum';
import { NzModalRef } from 'ng-zorro-antd';
import { ListsFacade } from '../+state/lists.facade';

@Component({
  selector: 'app-tags-popup',
  templateUrl: './tags-popup.component.html',
  styleUrls: ['./tags-popup.component.less']
})
export class TagsPopupComponent implements OnInit {

  @Input()
  list: List;

  tags: any[] = [];

  constructor(private modalRef: NzModalRef, private listsFacade: ListsFacade) {
  }

  confirm(): void {
    this.listsFacade.updateList(this.list);
    this.modalRef.close();
  }

  cancel(): void {
    this.modalRef.close();
  }

  ngOnInit(): void {
    this.tags = Object.keys(ListTag).map(key => {
      return {
        value: key,
        label: `LIST_TAGS.${key}`
      };
    });
  }

}
