import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SpearfishingShadowSize, SpearfishingSpeed } from '@ffxiv-teamcraft/types';
import { ItemDetailsPopup } from '../item-details-popup';
import { YoutubeEmbedPipe } from './youtube-embed.pipe';
import { NzPipesModule } from 'ng-zorro-antd/pipes';
import { NodeTypeIconPipe } from '../../../pipes/pipes/node-type-icon.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { MapComponent } from '../../map/map/map.component';
import { SpearfishingSpeedComponent } from '../../spearfishing-speed-tooltip/spearfishing-speed/spearfishing-speed.component';
import { ItemIconComponent } from '../../item-icon/item-icon/item-icon.component';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { FishingBaitComponent } from '../../fishing-bait/fishing-bait/fishing-bait.component';
import { NodeDetailsComponent } from '../../node-details/node-details/node-details.component';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';

@Component({
    selector: 'app-gathered-by',
    templateUrl: './gathered-by.component.html',
    styleUrls: ['./gathered-by.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, NgFor, FlexModule, NgSwitch, NgSwitchCase, DbButtonComponent, NgSwitchDefault, NodeDetailsComponent, FishingBaitComponent, NzTagModule, NzToolTipModule, ItemIconComponent, SpearfishingSpeedComponent, MapComponent, NzDividerModule, I18nPipe, TranslateModule, I18nRowPipe, NodeTypeIconPipe, NzPipesModule, YoutubeEmbedPipe]
})
export class GatheredByComponent extends ItemDetailsPopup {

  @Input()
  showAlarmsIntegration = false;

  SpearfishingSpeed = SpearfishingSpeed;

  SpearfishingShadowSize = SpearfishingShadowSize;

}
