import { Component } from '@angular/core';
import { ExplorationType } from '@ffxiv-teamcraft/types';
import { ItemDetailsPopup } from '../item-details-popup';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { NzListModule } from 'ng-zorro-antd/list';

@Component({
    selector: 'app-voyages',
    templateUrl: './voyages.component.html',
    styleUrls: ['./voyages.component.less'],
    standalone: true,
    imports: [NzListModule, I18nPipe, TranslateModule]
})
export class VoyagesComponent extends ItemDetailsPopup {

  ExplorationType = ExplorationType;

  constructor() {
    super();
  }

}
