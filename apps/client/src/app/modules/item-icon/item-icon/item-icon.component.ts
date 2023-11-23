import { booleanAttribute, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IpcService } from '../../../core/electron/ipc.service';
import { Router } from '@angular/router';
import { observeInput } from '../../../core/rxjs/observe-input';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { combineLatest, of } from 'rxjs';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NgIf, AsyncPipe } from '@angular/common';
import { XivapiItemTooltipDirective } from '../../tooltip/xivapi-tooltip/xivapi-item-tooltip.directive';

@Component({
    selector: 'app-item-icon',
    templateUrl: './item-icon.component.html',
    styleUrls: ['./item-icon.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [XivapiItemTooltipDirective, NgIf, NzSkeletonModule, AsyncPipe]
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

  @Input({ transform: booleanAttribute })
  tooltipDisabled = false;

  @Input({ transform: booleanAttribute })
  disableClick = false;

  @Input({ transform: booleanAttribute })
  forceCollectable = false;

  itemId$ = observeInput(this, 'itemId', true);

  icon$ = combineLatest([
    this.itemId$,
    observeInput(this, 'icon', true)
  ]).pipe(
    switchMap(([itemId, icon]) => {
      if (!itemId) {
        this.tooltipDisabled = true;
        this.disableClick = true;
      }
      // Asset icons
      if (icon?.toString().startsWith('./')) {
        return of(icon);
      }
      // No item id? just return the icon that we have
      if (!itemId) {
        return of(icon);
      }
      // GT icons
      if (icon && icon.toString() === icon && icon.toString().indexOf('custom/') > -1 && !icon.toString().startsWith('t/')) {
        return of(icon);
      }
      // Direct icons
      if (icon?.toString().startsWith('https://')) {
        return of(icon);
      }
      return this.lazyData.getRow('itemIcons', itemId).pipe(
        map(xivapiIcon => {
          if (xivapiIcon) {
            return `https://xivapi.com${xivapiIcon}`;
          }
          return undefined;
        })
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  collectable$ = combineLatest([
    this.itemId$,
    observeInput(this, 'forceCollectable', true)
  ]).pipe(
    switchMap(([itemId, forceCollectable]) => {
      if (forceCollectable) {
        return of(forceCollectable);
      }
      return this.lazyData.getRow('collectableFlags', itemId, 0).pipe(
        map(flag => flag === 1)
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(private translate: TranslateService, private lazyData: LazyDataFacade,
              private ipc: IpcService, private router: Router) {
  }

  getLink(): string {
    return `/db/${this.translate.currentLang}/item/${this.itemId}`;
  }

  handleClick(event: MouseEvent): void {
    event.preventDefault();
    if (this.disableClick || this.itemId === null || (event.type === 'mouseup' && event.button !== 1)) {
      return;
    }
    if (event.button === 1 || event.ctrlKey) {
      if (this.ipc.ready) {
        this.ipc.send('child:new', this.getLink());
      } else {
        window.open('https://ffxivteamcraft.com' + this.getLink(), '_blank');
      }
    } else if (this.ipc.overlayUri) {
      this.ipc.send('overlay:open-page', this.getLink());
    } else {
      this.router.navigateByUrl(this.getLink());
    }
  }

}
