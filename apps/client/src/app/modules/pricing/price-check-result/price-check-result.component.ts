import { Component } from '@angular/core';

@Component({
  selector: 'app-price-check-result',
  templateUrl: './price-check-result.component.html',
  styleUrls: ['./price-check-result.component.less']
})
export class PriceCheckResultComponent {
  items: any[];

  public data = [];

  constructor() {
  }

}
