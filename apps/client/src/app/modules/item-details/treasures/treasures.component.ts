import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { ItemIconComponent } from '../../item-icon/item-icon/item-icon.component';
import { ItemRarityDirective } from '../../../core/item-rarity/item-rarity.directive';
import { NzListModule } from 'ng-zorro-antd/list';

@Component({
    selector: 'app-treasures',
    templateUrl: './treasures.component.html',
    styleUrls: ['./treasures.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzListModule, ItemRarityDirective, ItemIconComponent, I18nPipe, ItemNamePipe]
})
export class TreasuresComponent extends ItemDetailsPopup {

  constructor() {
    super();
  }
}
