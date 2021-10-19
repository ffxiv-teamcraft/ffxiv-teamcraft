import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest, Observable, Subject } from 'rxjs';
import { I18nName } from '../../../model/common/i18n-name';
import { debounceTime, filter, map, switchMap } from 'rxjs/operators';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { ListRow } from '../../../modules/list/model/list-row';
import { UniversalisService } from '../../../core/api/universalis.service';
import { AuthFacade } from '../../../+state/auth.facade';
import { IpcService } from '../../../core/electron/ipc.service';
import { TranslateService } from '@ngx-translate/core';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { InventoryService } from '../../../modules/inventory/inventory.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';

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

  private items$: Observable<{ id: number, name: I18nName }[]> = this.lazyData.getI18nItems().pipe(
    map(items => {
      return Object.keys(items)
        .filter(key => +key > 19)
        .map(key => {
          return {
            id: +key,
            name: items[key]
          };
        });
    })
  );

  public input$: Subject<string> = new Subject<string>();

  public completion$: Observable<{ id: number, name: I18nName }[]> = combineLatest([
    this.input$,
    this.items$
  ]).pipe(
    debounceTime(500),
    map(([value, items]) => {
      if (value.length < 2) {
        return [];
      } else {
        const suggestions = items.filter(i => this.i18n.getName(i.name).toLowerCase().indexOf(value.toLowerCase()) > -1);
        // If the only suggestion is the current input, don't show suggestions.
        if (suggestions.length === 1 && this.i18n.getName(suggestions[0].name).toLowerCase() === value.toLowerCase()) {
          return [];
        }
        return suggestions;
      }
    })
  );

  public selectedItem$: Observable<Display> = combineLatest([
    this.input$,
    this.items$
  ]).pipe(
    map(([input, items]) => {
      let item;
      if (input.toString() === input) {
        item = items.find(i => this.i18n.getName(i.name).toLowerCase() === input.toLowerCase());
      } else {
        item = items.find(i => i.id === +input);
      }
      return item;
    }),
    filter(item => item !== undefined),
    switchMap(item => {
      return this.lazyData.getRow('extracts', item.id);
    }),
    switchMap(extract => {
      return this.inventoryFacade.inventory$.pipe(
        switchMap(inventory => {
          return this.lazyData.getEntry('marketItems').pipe(
            map(marketItems => {
              return {
                data: extract,
                inventoryItems: inventory.getItem(extract.id).map(item => {
                  return {
                    ...item,
                    containerName: this.inventoryFacade.getContainerDisplayName(item)
                  };
                }),
                canBeSold: marketItems.includes(extract.id)
              };
            })
          );
        })
      );
    })
  );

  constructor(private i18n: I18nToolsService, private lazyData: LazyDataFacade,
              private inventoryFacade: InventoryService, private universalisService: UniversalisService,
              private authFacade: AuthFacade, private ipc: IpcService, private translate: TranslateService) {
  }

  openInMainWindow(id: number): void {
    this.ipc.send('overlay:open-page', `/db/${this.translate.currentLang}/item/${id}`);
  }

}
