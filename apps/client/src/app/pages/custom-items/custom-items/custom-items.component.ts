import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CustomItem } from '../../../modules/custom-items/model/custom-item';
import { combineLatest, Observable } from 'rxjs';
import { CustomItemsFacade } from '../../../modules/custom-items/+state/custom-items.facade';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NameQuestionPopupComponent } from '../../../modules/name-question-popup/name-question-popup/name-question-popup.component';
import { filter, first, map, mergeMap, shareReplay, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { CustomItemFolder } from '../../../modules/custom-items/model/custom-item-folder';
import { CustomItemsDisplay } from '../../../modules/custom-items/+state/custom-items-display';
import { DataModel } from '../../../core/database/storage/data-model';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { CustomAlarmPopupComponent } from '../../../modules/custom-alarm-popup/custom-alarm-popup/custom-alarm-popup.component';
import { Alarm } from '../../../core/alarms/alarm';
import { NpcPickerComponent } from '../npc-picker/npc-picker.component';
import { Vendor } from '../../../modules/list/model/vendor';
import { TradeSource } from '../../../modules/list/model/trade-source';
import { ItemPickerComponent } from '../../../modules/item-picker/item-picker/item-picker.component';
import { Trade } from '../../../modules/list/model/trade';
import { SearchResult } from '../../../model/search/search-result';
import { TradeEntry } from '../../../modules/list/model/trade-entry';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { CustomIngredient } from '../../../modules/custom-items/model/custom-ingredient';
import { Ingredient } from '../../../model/garland-tools/ingredient';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { List } from '../../../modules/list/model/list';
import { saveAs } from 'file-saver';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { CustomItemsImportPopupComponent } from '../custom-items-import-popup/custom-items-import-popup.component';
import { CustomItemsExportPopupComponent } from '../custom-items-export-popup/custom-items-export-popup.component';
import { getItemSource } from '../../../modules/list/model/list-row';
import { DataType } from '../../../modules/list/data/data-type';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';

@Component({
  selector: 'app-custom-items',
  templateUrl: './custom-items.component.html',
  styleUrls: ['./custom-items.component.less']
})
export class CustomItemsComponent {

  public display$: Observable<CustomItemsDisplay> = this.customItemsFacade.customItemsDisplay$;

  public loading$: Observable<boolean> = combineLatest([this.customItemsFacade.loaded$, this.customItemsFacade.foldersLoaded$]).pipe(
    map(([itemsLoaded, foldersLoaded]) => !itemsLoaded || !foldersLoaded)
  );

  public maps$: Observable<{ ID: number, PlaceName: any }[]>;

  public availableCraftJobs: any[] = [];

  @ViewChild('notificationRef', { static: true })
  notification: TemplateRef<any>;

  public modifiedList: List;

  private folders$ = this.customItemsFacade.allCustomItemFolders$;

  constructor(private customItemsFacade: CustomItemsFacade, private dialog: NzModalService,
              private translate: TranslateService, private xivapi: XivapiService,
              private lazyData: LazyDataFacade, private gt: GarlandToolsService,
              private listsFacade: ListsFacade, private listPicker: ListPickerService,
              private listManager: ListManagerService, private progressService: ProgressPopupService,
              private notificationService: NzNotificationService, private i18n: I18nToolsService) {
    this.customItemsFacade.loadAll();
    this.customItemsFacade.loadAllFolders();
    this.maps$ = this.xivapi.getList(XivapiEndpoint.Map, { columns: ['ID', 'PlaceName.Name_*'], max_items: 1000 }).pipe(
      map(list => list.Results),
      shareReplay({ bufferSize: 1, refCount: true })
    );
    this.gt.onceLoaded$.pipe(first()).subscribe(() => {
      this.availableCraftJobs = this.gt.getJobs().filter(job => job.category.indexOf('Hand') > -1);
    });
  }

  public createCustomItem(): void {
    this.dialog.create({
      nzContent: NameQuestionPopupComponent,
      nzFooter: null,
      nzTitle: this.translate.instant('CUSTOM_ITEMS.New_item')
    }).afterClose.pipe(
      filter(name => name !== undefined)
    ).subscribe((name) => {
      const item = new CustomItem();
      item.name = name;
      this.customItemsFacade.addCustomItem(item);
    });
  }

  public deleteCustomItem(key: string): void {
    this.customItemsFacade.deleteCustomItem(key);
  }

  public updateCustomItem(item: CustomItem): void {
    this.customItemsFacade.updateCustomItem(this.beforeSave(item));
  }

  public createFolder(): void {
    this.dialog.create({
      nzContent: NameQuestionPopupComponent,
      nzFooter: null,
      nzTitle: this.translate.instant('CUSTOM_ITEMS.New_folder')
    }).afterClose.pipe(
      filter(name => name !== undefined)
    ).subscribe((name) => {
      const folder = new CustomItemFolder();
      folder.name = name;
      this.customItemsFacade.addCustomItemFolder(folder);
    });
  }

  public deleteCustomItemFolder(key: string): void {
    this.customItemsFacade.deleteCustomItemFolder(key);
  }

  public importItems(): void {
    this.dialog.create({
      nzContent: CustomItemsImportPopupComponent,
      nzComponentParams: {
        availableCraftJobs: this.availableCraftJobs
      },
      nzFooter: null,
      nzTitle: this.translate.instant('CUSTOM_ITEMS.Import_items')
    });
  }

  public exportMultipleItems(allItems: CustomItemsDisplay): void {
    this.dialog.create({
      nzContent: CustomItemsExportPopupComponent,
      nzFooter: null,
      nzTitle: this.translate.instant('CUSTOM_ITEMS.Export_items')
    }).afterClose
      .pipe(filter(res => res !== undefined))
      .subscribe(items => {
        this.exportItems(items, allItems);
      });
  }

  public autoCompleteItemID(name: string, item: CustomItem): void {
    this.lazyData.getEntry('items').subscribe(allItems => {
      const matches = Object.keys(allItems).filter(key => {
        return this.i18n.getName(allItems[key]).toLowerCase() === name.toLowerCase();
      });
      if (matches.length === 1) {
        item.realItemId = +matches[0];
      }
    });
  }

  public setItemIndex(item: CustomItem, index: number, array: CustomItem[], folderId: string | undefined): void {
    // If it comes from a folder and we're not inside a folder, remove it from the previous folder :D
    if (item.folderId !== folderId) {
      this.folders$.pipe(first()).subscribe(folders => {
        if (item.folderId !== undefined) {
          const previousFolder = folders.find(f => f.$key === item.folderId);
          previousFolder.items = previousFolder.items.filter(key => key !== item.$key);
          this.customItemsFacade.updateCustomItemFolder(previousFolder);
          delete item.folderId;
        }
        if (folderId !== undefined) {
          item.folderId = folderId;
          const newFolder = folders.find(f => f.$key === item.folderId);
          newFolder.items.push(item.$key);
          this.customItemsFacade.updateCustomItemFolder(newFolder);
        }
      });
    }
    // Remove item from the array
    array = array.filter(i => i.$key !== item.$key);
    // Insert it at new index
    array.splice(index, 0, item);
    // Update indexes and persist
    array
      .map((row, i) => {
        if (row.index !== i) {
          row.index = i;
        }
        return row;
      })
      .forEach(i => {
        this.customItemsFacade.updateCustomItem(i);
        i.dirty = false;
      });
  }

  public setFolderIndex(folder: CustomItemFolder, index: number, array: CustomItemFolder[]): void {
    // Remove item from the array
    array = array.filter(i => i.$key !== folder.$key);
    // Insert it at new index
    array.splice(index, 0, folder);
    // Update indexes and persist
    array
      .map((row, i) => {
        if (row.index !== i) {
          row.index = i;
        }
        return row;
      })
      .forEach(f => {
        this.customItemsFacade.updateCustomItemFolder(f);
      });
  }

  public trackByKey(index: number, data: DataModel): string {
    return data.$key;
  }

  public trackByFolderKey(index: number, data: any): string {
    return data.folder.$key;
  }

  public trackByVendor(index: number, vendor: Vendor): number {
    return vendor.npcId;
  }

  public trackByTradeSource(index: number): number {
    return index;
  }

  public trackByRequirement(index: number, req: Ingredient): number | string {
    return req.id;
  }

  public addToList(item: CustomItem, amount: string): void {
    this.listPicker.pickList().pipe(
      mergeMap(list => {
        return this.progressService.showProgress(this.listManager.addToList({ itemId: item.$key, list: list, recipeId: '', amount: +amount }),
          1,
          'Adding_recipes',
          { amount: 1, listname: list.name });
      }),
      tap(list => list.$key ? this.listsFacade.updateList(list) : this.listsFacade.addList(list)),
      mergeMap(list => {
        // We want to get the list created before calling it a success, let's be pessimistic !
        return this.progressService.showProgress(
          combineLatest([this.listsFacade.myLists$, this.listsFacade.listsWithWriteAccess$]).pipe(
            map(([myLists, listsICanWrite]) => [...myLists, ...listsICanWrite]),
            map(lists => lists.find(l => l.createdAt.seconds === list.createdAt.seconds && l.$key !== undefined)),
            filter(l => l !== undefined),
            first()
          ), 1, 'Saving_in_database');
      })
    ).subscribe((list) => {
      this.modifiedList = list;
      this.notificationService.template(this.notification);
    });
  }

  public exportItems(items: CustomItem[], display: CustomItemsDisplay): void {
    const allItems = display.otherItems.concat(...display.folders.map(f => f.items));
    const reqs = items.map(item => {
      return item.requires.filter(req => req.custom)
        .map(req => allItems.find(i => i.$key === req.id));
    });
    const data = [].concat.apply([], [...items, ...reqs]).filter((item, index, array) => {
      // Remove duplicates
      return array.indexOf(item) === index;
    }).map(item => {
      item.dirty = false;
      return item;
    });
    const blob = new Blob([btoa(unescape(encodeURIComponent(JSON.stringify(data))))], { type: 'text/plain;charset:utf-8' });
    saveAs(blob,
      // We're creating a hash to avoid too large file names.
      `${items.map(i => i.name)
        .join('&')
        .split('')
        .reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0)
      }.tcitem`);
  }

  renameFolder(folder: CustomItemFolder): void {
    this.dialog.create({
      nzContent: NameQuestionPopupComponent,
      nzFooter: null,
      nzTitle: this.translate.instant('CUSTOM_ITEMS.Rename_folder'),
      nzComponentParams: {
        baseName: folder.name
      }
    }).afterClose.pipe(
      filter(name => name !== undefined)
    ).subscribe((name) => {
      folder.name = name;
      this.customItemsFacade.updateCustomItemFolder(folder);
    });
  }

  /**
   *
   *  CRAFTING
   *
   */
  public addCraft(item: CustomItem): void {
    // We allow only one craft for now, handling multiple ones would be kinda hard and p much useless.
    item.sources.push({
      type: DataType.CRAFTED_BY,
      data: [{
        jobId: 8,
        level: 1,
        icon: '',
        stars_tooltip: '',
        itemId: item.$key,
        recipeId: `${item.$key}:recipe`
      }]
    });
    item.dirty = true;
  }

  /**
   * Details writing
   */

  public addIngredient(item: CustomItem): void {
    this.dialog.create({
      nzTitle: this.translate.instant('Pick_an_item'),
      nzFooter: null,
      nzContent: ItemPickerComponent,
      nzComponentParams: {
        onlyCraftable: false,
        includeCustomItems: true
      }
    }).afterClose
      .pipe(
        filter(res => res !== undefined)
      )
      .subscribe((res: SearchResult) => {
        item.requires = item.requires || [];
        item.requires.push({
          id: res.itemId,
          amount: res.amount,
          custom: res.isCustom
        });
        item.dirty = true;
      });
  }

  public deleteIngredient(ingredient: CustomIngredient | Ingredient, item: CustomItem): void {
    item.requires = item.requires.filter(r => r !== ingredient);
    item.dirty = true;
  }

  public deleteCraft(item: CustomItem): void {
    item.sources = item.sources.filter(s => s.type !== DataType.CRAFTED_BY);
    item.dirty = true;
  }

  /**
   *
   *  GATHERING
   *
   */
  public addGathering(item: CustomItem): void {
    item.sources.push({
      type: DataType.GATHERED_BY,
      data: {
        type: 0,
        folklore: 0,
        icon: '',
        level: 70,
        nodes: [
          {
            mapid: 0,
            zoneid: 0,
            areaid: 1,
            level: 1,
            coords: [0, 0],
            slot: '?'
          }
        ],
        stars_tooltip: ''
      }
    });
    item.dirty = true;
  }

  public deleteGathering(item: CustomItem): void {
    item.sources = item.sources.filter(s => s.type !== DataType.GATHERED_BY);
    item.dirty = true;
  }

  /**
   *
   *  ALARMS
   *
   */

  public addAlarm(item: CustomItem): void {
    item.alarms = item.alarms || [];
    let componentParams: Partial<CustomAlarmPopupComponent> = { returnAlarm: true, name: item.name };
    if (getItemSource(item, DataType.GATHERED_BY, true).type !== undefined) {
      componentParams = {
        ...componentParams,
        x: getItemSource(item, DataType.GATHERED_BY, true).nodes[0].x,
        y: getItemSource(item, DataType.GATHERED_BY, true).nodes[0].y,
        mapId: getItemSource(item, DataType.GATHERED_BY, true).nodes[0].map,
        type: getItemSource(item, DataType.GATHERED_BY, true).type
      };
    }
    this.dialog.create({
      nzTitle: this.translate.instant('CUSTOM_ITEMS.DETAILS.ALARMS.Add_alarm'),
      nzFooter: null,
      nzContent: CustomAlarmPopupComponent,
      nzComponentParams: componentParams
    }).afterClose
      .pipe(
        filter(res => res !== undefined)
      )
      .subscribe(alarm => {
        item.alarms.push(alarm);
        item.dirty = true;
      });
  }

  public editAlarm(item: CustomItem, alarm: Alarm): void {
    const alarmIndex = item.alarms.indexOf(alarm);
    this.dialog.create({
      nzTitle: this.translate.instant('CUSTOM_ITEMS.DETAILS.ALARMS.Edit_alarm'),
      nzFooter: null,
      nzContent: CustomAlarmPopupComponent,
      nzComponentParams: {
        returnAlarm: true,
        spawn: alarm.spawns[0],
        duration: alarm.duration,
        spawnsTwice: alarm.spawns.length > 1,
        x: alarm.coords.x,
        y: alarm.coords.y,
        type: alarm.type,
        mapId: alarm.mapId,
        name: alarm.name
      }
    }).afterClose
      .pipe(
        filter(res => res !== undefined)
      )
      .subscribe(edited => {
        item.alarms[alarmIndex] = edited;
        item.dirty = true;
      });
  }

  public deleteAlarm(item: CustomItem, alarm: Alarm): void {
    item.alarms = item.alarms.filter(a => a !== alarm);
    item.dirty = true;
  }

  /**
   *
   *  VENDORS
   *
   */

  public addVendor(item: CustomItem): void {
    this.dialog.create({
      nzTitle: this.translate.instant('CUSTOM_ITEMS.NPC_PICKER.Title'),
      nzFooter: null,
      nzContent: NpcPickerComponent
    }).afterClose
      .pipe(
        filter(res => res !== undefined)
      )
      .subscribe(npc => {
        const vendors = getItemSource(item, DataType.VENDORS);
        if (vendors.length === 0) {
          item.sources.push({
            type: DataType.VENDORS,
            data: [{
              // 21 is "eorzea" :)
              zoneId: npc.position === null ? 21 : npc.position.zoneid,
              price: 1,
              coords: npc.position === null ? { x: 1, y: 1 } : { x: npc.position.x, y: npc.position.y },
              mapId: npc.position === null ? 2 : npc.position.map,
              areaId: npc.position === null ? 21 : npc.position.zoneid,
              npcId: npc.id
            }]
          });
        } else {
          vendors.push({
            // 21 is "eorzea" :)
            zoneId: npc.position === null ? 21 : npc.position.zoneid,
            price: 1,
            coords: npc.position === null ? { x: 1, y: 1 } : { x: npc.position.x, y: npc.position.y },
            mapId: npc.position === null ? 2 : npc.position.map,
            areaId: npc.position === null ? 21 : npc.position.zoneid,
            npcId: npc.id
          });
        }
        item.dirty = true;
      });
  }

  public deleteVendor(item: CustomItem, vendor: Vendor): void {
    const vendors = item.sources.find(source => source.type === DataType.VENDORS);
    vendors.data = vendors.data.filter(v => v !== vendor);
    item.dirty = true;
  }

  /**
   *
   *  TRADE SOURCES
   *
   */

  public addTrade(item: CustomItem): void {
    this.dialog.create({
      nzTitle: this.translate.instant('CUSTOM_ITEMS.NPC_PICKER.Title'),
      nzFooter: null,
      nzContent: NpcPickerComponent
    }).afterClose
      .pipe(
        filter(res => res !== undefined)
      )
      .subscribe(npc => {
        const tradeSources = getItemSource(item, DataType.TRADE_SOURCES);
        const ts = {
          npcs: [
            {
              id: npc.id,
              coords: npc.position === null ? { x: 1, y: 1 } : { x: npc.position.x, y: npc.position.y },
              mapId: npc.position === null ? 2 : npc.position.map,
              zoneId: npc.position === null ? 21 : npc.position.zoneid,
              areaId: npc.position === null ? 21 : npc.position.zoneid
            }
          ],
          trades: [
            {
              currencies: [],
              items: [
                {
                  id: item.$key,
                  amount: 1,
                  hq: false,
                  // TODO: connect custom item icon here
                  icon: ''
                }
              ]
            }
          ]
        };
        if (tradeSources.length === 0) {
          item.sources.push({
            type: DataType.TRADE_SOURCES,
            data: [ts]
          });
        } else {
          tradeSources.push(ts);
        }
        item.dirty = true;
      });
  }

  public addCurrency(item: CustomItem, trade: Trade): void {
    this.dialog.create({
      nzTitle: this.translate.instant('Pick_an_item'),
      nzFooter: null,
      nzContent: ItemPickerComponent,
      nzComponentParams: {
        onlyCraftable: false
      }
    }).afterClose
      .pipe(
        filter(res => res !== undefined)
      )
      .subscribe((res: SearchResult) => {
        trade.currencies.push({
          id: res.itemId,
          icon: res.icon,
          hq: false,
          amount: res.amount
        });
        item.dirty = true;
      });
  }

  public deleteCurrency(item: CustomItem, trade: Trade, currency: TradeEntry): void {
    trade.currencies = trade.currencies.filter(c => c !== currency);
    item.dirty = true;
  }

  public deleteTrade(item: CustomItem, tradeSources: TradeSource): void {
    const tradeSourceData = item.sources.find(source => source.type === DataType.TRADE_SOURCES);
    tradeSourceData.data = tradeSourceData.data.filter(t => t !== tradeSources);
    item.dirty = true;
  }

  /**
   *
   *  REDUCTIONS
   *
   */
  public addReduction(item: CustomItem): void {
    this.dialog.create({
      nzTitle: this.translate.instant('Pick_an_item'),
      nzFooter: null,
      nzContent: ItemPickerComponent,
      nzComponentParams: {
        onlyCraftable: false,
        hideAmount: true
      }
    }).afterClose
      .pipe(
        filter(res => res !== undefined)
      )
      .subscribe((res: SearchResult) => {
        const reducedFrom = getItemSource(item, DataType.REDUCED_FROM);
        if (reducedFrom.length === 0) {
          item.sources.push({
            type: DataType.REDUCED_FROM,
            data: [+res.itemId]
          });
        } else {
          reducedFrom.push(+res.itemId);
        }
        item.dirty = true;
      });
  }

  public deleteReduction(item: CustomItem, reduction: any): void {
    const tradeSourceData = item.sources.find(source => source.type === DataType.REDUCED_FROM);
    tradeSourceData.data = tradeSourceData.data.filter(r => r !== reduction);
    item.dirty = true;
  }

  private beforeSave(item: CustomItem): CustomItem {
    if (getItemSource(item, DataType.GATHERED_BY, true).type !== undefined) {
      getItemSource(item, DataType.GATHERED_BY, true).nodes[0].zoneId = getItemSource(item, DataType.GATHERED_BY, true).nodes[0].map;
      getItemSource(item, DataType.GATHERED_BY, true).nodes[0].level = getItemSource(item, DataType.GATHERED_BY, true).level;
    }
    if (getItemSource(item, DataType.VENDORS).length > 0) {
      item.sources = item.sources.map(source => {
        if (source.type === DataType.VENDORS) {
          source.data = source.data.map(
            vendor => {
              vendor.areaId = vendor.zoneId = vendor.mapId;
              return vendor;
            });
        }
        return source;
      });
    }
    if (getItemSource(item, DataType.TRADE_SOURCES).length > 0) {
      item.sources = item.sources.map(source => {
        if (source.type === DataType.TRADE_SOURCES) {
          source.data = source.data.map(
            tradeSource => {
              tradeSource.npcs[0].areaId = tradeSource.npcs[0].zoneId = tradeSource.npcs[0].mapId;
              return tradeSource;
            });
        }
        return source;
      });
    }
    if (getItemSource(item, DataType.CRAFTED_BY).length > 0) {
      item.sources = item.sources.map(source => {
        if (source.type === DataType.CRAFTED_BY) {
          source.data = source.data.map(craft => {
            craft.icon = `https://garlandtools.org/db/images/${this.availableCraftJobs.find(j => j.id === craft.jobId).abbreviation}.png`;
            return craft;
          });
        }
        return source;
      });
    }
    return item;
  }

}
