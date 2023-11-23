import { Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { TranslateService } from '@ngx-translate/core';
import { LazyRowPipe } from '../../../pipes/pipes/lazy-row.pipe';
import { MapNamePipe } from '../../../pipes/pipes/map-name.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { RouterLink } from '@angular/router';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { NgIf, AsyncPipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzListModule } from 'ng-zorro-antd/list';

@Component({
    selector: 'app-instances',
    templateUrl: './instances.component.html',
    styleUrls: ['./instances.component.less'],
    standalone: true,
    imports: [NzListModule, FlexModule, NgIf, DbButtonComponent, RouterLink, NzButtonModule, NzIconModule, AsyncPipe, I18nPipe, I18nRowPipe, MapNamePipe, LazyRowPipe]
})
export class InstancesComponent extends ItemDetailsPopup {

  constructor(public translate: TranslateService) {
    super();
  }

}
