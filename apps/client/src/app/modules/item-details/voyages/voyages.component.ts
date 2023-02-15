import { Component } from '@angular/core';
import { ExplorationType } from '@ffxiv-teamcraft/types';
import { ItemDetailsPopup } from '../item-details-popup';

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
