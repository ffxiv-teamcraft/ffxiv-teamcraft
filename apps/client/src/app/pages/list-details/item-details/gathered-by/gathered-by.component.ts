import { Component, OnInit } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';

@Component({
  selector: 'app-gathered-by',
  templateUrl: './gathered-by.component.html',
  styleUrls: ['./gathered-by.component.less']
})
export class GatheredByComponent extends ItemDetailsPopup implements OnInit {

  constructor() {
    super();
  }

  getDespawnTime(time: number, uptime: number): string {
    const res = (time + uptime / 60) % 24;
    return res.toString();
  }

  ngOnInit() {
  }

}
