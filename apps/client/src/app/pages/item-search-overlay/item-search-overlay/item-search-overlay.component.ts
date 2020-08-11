import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { I18nName } from '../../../model/common/i18n-name';
import { debounceTime, filter, map, switchMap } from 'rxjs/operators';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { ListRow } from '../../../modules/list/model/list-row';
import { InventoryFacade } from '../../../modules/inventory/+state/inventory.facade';
import { UniversalisService } from '../../../core/api/universalis.service';
import { AuthFacade } from '../../../+state/auth.facade';
import { IpcService } from '../../../core/electron/ipc.service';
import { TranslateService } from '@ngx-translate/core';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';

interface Display {
  data: ListRow,
  inventoryItems: InventoryItem[],
  canBeSold: boolean;
}

@Component({
  selector: 'app-item-search-overlay',
  templateUrl: './item-search-overlay.component.html',
  styleUrls: ['./item-search-overlay.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemSearchOverlayComponent {

  private items: { id: number, name: I18nName }[] = [];

  public input$: Subject<string> = new Subject<string>();

  public completion$: Observable<{ id: number, name: I18nName }[]> = this.input$.pipe(
    debounceTime(500),
    map(value => {
      if (value.length < 2) {
        return [];
      } else {
        const suggestions = this.items.filter(i => this.i18n.getName(i.name).toLowerCase().indexOf(value.toLowerCase()) > -1);
        // If the only suggestion is the current input, don't show suggestions.
        if (suggestions.length === 1 && this.i18n.getName(suggestions[0].name).toLowerCase() === value.toLowerCase()) {
          return [];
        }
        return suggestions;
      }
    })
  );

  public selectedItem$: Observable<Display> = this.input$.pipe(
    map(input => {
      let item;
      if (input.toString() === input) {
        item = this.items.find(i => this.i18n.getName(i.name).toLowerCase() === input.toLowerCase());
      } else {
        item = this.items.find(i => i.id === +input);
      }
      return item;
    }),
    filter(item => item !== undefined),
    map(item => {
      return this.lazyData.getExtract(item.id);
    }),
    switchMap(extract => {
      return this.inventoryFacade.inventory$.pipe(
        map(inventory => {
          return {
            data: extract,
            inventoryItems: inventory.getItem(extract.id).map(item => {
              return {
                ...item,
                containerName: this.inventoryFacade.getContainerDisplayName(item)
              };
            }),
            canBeSold: this.lazyData.data.marketItems.indexOf(extract.id) > -1
          };
        })
      );
    })
  );

  constructor(private i18n: I18nToolsService, private lazyData: LazyDataService,
              private inventoryFacade: InventoryFacade, private universalisService: UniversalisService,
              private authFacade: AuthFacade, private ipc: IpcService, private translate: TranslateService) {
    const allItems = this.lazyData.allItems;
    this.items = Object.keys(this.lazyData.data.items)
      .filter(key => +key > 19)
      .map(key => {
        return {
          id: +key,
          name: allItems[key]
        };
      });
  }

  openInMainWindow(id: number): void {
    this.ipc.send('overlay:open-page', `/db/${this.translate.currentLang}/item/${id}`);
  }

}
