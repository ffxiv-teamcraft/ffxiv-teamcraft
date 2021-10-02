import { Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { ExplorationType } from '../../../model/other/exploration-type';

@Component({
  selector: 'app-voyages',
  templateUrl: './voyages.component.html',
  styleUrls: ['./voyages.component.less']
})
export class VoyagesComponent extends ItemDetailsPopup {

  ExplorationType = ExplorationType;

  constructor() {
    super();
  }

}
