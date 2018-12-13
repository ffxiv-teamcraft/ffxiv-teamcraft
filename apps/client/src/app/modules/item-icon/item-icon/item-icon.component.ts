import { Component, Input } from '@angular/core';
import { SettingsService } from '../../settings/settings.service';

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
  icon: number;

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

  constructor(private settings: SettingsService) {
  }

  getLink(): string {
    return `https://garlandtools.org/db/#item/${this.itemId}`;
  }

}
