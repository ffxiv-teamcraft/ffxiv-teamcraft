import { Component, Input, OnInit } from '@angular/core';
import { ListRow } from '../../../modules/list/model/list-row';

@Component({
  selector: 'app-list-crystals-panel',
  templateUrl: './list-crystals-panel.component.html',
  styleUrls: ['./list-crystals-panel.component.less']
})
export class ListCrystalsPanelComponent implements OnInit {

  @Input()
  crystals: ListRow[] = [];

  constructor() { }

  ngOnInit() {
  }

  trackByItem(index: number, item: ListRow): number {
    return item.id;
  }

}
