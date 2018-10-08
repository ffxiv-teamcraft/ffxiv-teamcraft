import { Component, OnInit } from '@angular/core';
import { List } from '../../../modules/list/model/list';
import { Inventory } from '../../../model/other/inventory';

@Component({
  selector: 'app-inventory-view',
  templateUrl: './inventory-view.component.html',
  styleUrls: ['./inventory-view.component.less']
})
export class InventoryViewComponent implements OnInit {

  public list: List;

  public display: { id: number, icon: number, amount: number }[][] = [];

  constructor() {
  }

  ngOnInit() {
    const inventory = new Inventory();
    this.list.forEach(item => {
      inventory.add(item.id, item.icon, item.done - item.used);
    });
    this.display = inventory.getDisplay();
  }

}
