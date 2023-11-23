import { Component, Input } from '@angular/core';
import { FishingBait } from '@ffxiv-teamcraft/types';
import { TugNamePipe } from '../../../pipes/pipes/tug-name.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ItemIconComponent } from '../../item-icon/item-icon/item-icon.component';
import { NgFor, NgIf } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-fishing-bait',
    templateUrl: './fishing-bait.component.html',
    styleUrls: ['./fishing-bait.component.less'],
    standalone: true,
    imports: [FlexModule, NgFor, ItemIconComponent, NgIf, NzButtonModule, NzIconModule, I18nPipe, TranslateModule, ItemNamePipe, TugNamePipe]
})
export class FishingBaitComponent {

  @Input()
  baits: FishingBait[];

  @Input()
  flex: 'row' | 'column' = 'column';

  @Input()
  hideNames = false;

  @Input()
  iconWidth = 32;
}
