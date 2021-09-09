import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { IpcService } from '../../../core/electron/ipc.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-item-icon',
  templateUrl: './item-icon.component.html',
  styleUrls: ['./item-icon.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemIconComponent implements OnChanges {

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

  @Input()
  forceCollectable = false;

  collectable = false;

  constructor(private translate: TranslateService, private lazyData: LazyDataService,
              private ipc: IpcService, private router: Router) {
  }

  getLink(): string {
    return `/db/${this.translate.currentLang}/item/${this.itemId}`;
  }

  handleClick(event: MouseEvent): void {
    if (this.disableClick) {
      return;
    }
    if (event.which === 2) {
      this.ipc.send('open-link', 'https://ffxivteamcraft.com' + this.getLink());
    } else if (this.ipc.overlayUri) {
      this.ipc.send('overlay:open-page', this.getLink());
    } else {
      this.router.navigateByUrl(this.getLink());
    }
  }

  getIcon(): string {
    if (this.icon && this.icon.toString() === this.icon && this.icon.indexOf('custom/') > -1 && !this.icon.startsWith('t/')) {
      return this.icon;
    }
    if (this.lazyData.data.itemIcons[this.itemId]) {
      return `https://xivapi.com${this.lazyData.data.itemIcons[this.itemId]}`;
    } else {
      return 'https://xivapi.com/img-misc/code-regular.svg';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.forceCollectable) {
      this.collectable = true;
    } else if (changes.itemId) {
      this.collectable = this.lazyData.data.collectables[this.itemId]?.collectable;
    }
  }

}
