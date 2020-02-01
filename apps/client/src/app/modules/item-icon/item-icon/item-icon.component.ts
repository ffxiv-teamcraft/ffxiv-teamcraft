import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LazyDataService } from '../../../core/data/lazy-data.service';

@Component({
  selector: 'app-item-icon',
  templateUrl: './item-icon.component.html',
  styleUrls: ['./item-icon.component.less']
})
export class ItemIconComponent {

  /**
   * The id of the icon of the item.
   */
  @Input()
  icon: number | string;

  /**
   * name of the item, used as alt attribute for the icon.
   */
  @Input()
  itemName: string;

  /**
   * The id of the item, used for tooltip.
   */
  @Input()
  itemId: number;

  @Input()
  hq = false;

  @Input()
  width = 48;

  @Input()
  tooltipDisabled = false;

  @Input()
  disableClick = false;

  constructor(private translate: TranslateService, private lazyData: LazyDataService) {
  }

  getLink(): string {
    return `/db/${this.translate.currentLang}/item/${this.itemId}`;
  }

  getIcon(): string {
    if (this.icon && this.icon.toString() === this.icon && this.icon.indexOf('custom/') > -1 && !this.icon.startsWith('t/')) {
      return this.icon;
    }
    return `https://xivapi.com${this.lazyData.data.itemIcons[this.itemId]}`;
  }

}
