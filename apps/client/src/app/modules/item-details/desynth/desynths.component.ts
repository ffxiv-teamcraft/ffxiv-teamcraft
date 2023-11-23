import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { LazyIconPipe } from '../../../pipes/pipes/lazy-icon.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { ItemIconComponent } from '../../item-icon/item-icon/item-icon.component';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { ItemRarityDirective } from '../../../core/item-rarity/item-rarity.directive';
import { FlexModule } from '@angular/flex-layout/flex';
import { LazyScrollComponent } from '../../lazy-scroll/lazy-scroll/lazy-scroll.component';
import { NzListModule } from 'ng-zorro-antd/list';

@Component({
    selector: 'app-desynths',
    templateUrl: './desynths.component.html',
    styleUrls: ['./desynths.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzListModule, LazyScrollComponent, FlexModule, ItemRarityDirective, DbButtonComponent, ItemIconComponent, I18nPipe, ItemNamePipe, LazyIconPipe]
})
export class DesynthsComponent extends ItemDetailsPopup {
}
