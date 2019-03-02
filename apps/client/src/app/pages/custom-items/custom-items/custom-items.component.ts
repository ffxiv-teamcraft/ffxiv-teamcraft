import { Component } from '@angular/core';
import { CustomItem } from '../../../modules/custom-items/model/custom-item';
import { combineLatest, Observable, Subject } from 'rxjs';
import { CustomItemsFacade } from '../../../modules/custom-items/+state/custom-items.facade';
import { NzModalService } from 'ng-zorro-antd';
import { NameQuestionPopupComponent } from '../../../modules/name-question-popup/name-question-popup/name-question-popup.component';
import { debounceTime, filter, first, map, shareReplay } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { CustomItemFolder } from '../../../modules/custom-items/model/custom-item-folder';
import { CustomItemsDisplay } from '../../../modules/custom-items/+state/custom-items-display';
import { DataModel } from '../../../core/database/storage/data-model';
import { NodeTypeIconPipe } from '../../../pipes/node-type-icon.pipe';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { CustomAlarmPopupComponent } from '../../../modules/custom-alarm-popup/custom-alarm-popup/custom-alarm-popup.component';
import { Alarm } from '../../../core/alarms/alarm';
import { LazyDataService } from '../../../core/data/lazy-data.service';

@Component({
  selector: 'app-custom-items',
  templateUrl: './custom-items.component.html',
  styleUrls: ['./custom-items.component.less']
})
export class CustomItemsComponent {

  public display$: Observable<CustomItemsDisplay> = this.customItemsFacade.customItemsDisplay$;

  public loading$: Observable<boolean> = combineLatest(this.customItemsFacade.loaded$, this.customItemsFacade.foldersLoaded$).pipe(
    map(([itemsLoaded, foldersLoaded]) => !itemsLoaded || !foldersLoaded)
  );

  private folders$ = this.customItemsFacade.allCustomItemFolders$;

  public maps$: Observable<{ ID: number, PlaceName: any }[]>;

  constructor(private customItemsFacade: CustomItemsFacade, private dialog: NzModalService,
              private translate: TranslateService, private xivapi: XivapiService,
              private lazyData: LazyDataService) {
    this.customItemsFacade.loadAll();
    this.customItemsFacade.loadAllFolders();
    this.maps$ = this.xivapi.getList(XivapiEndpoint.Map, { columns: ['ID', 'PlaceName.Name_*'], max_items: 1000 }).pipe(
      map(list => list.Results),
      shareReplay(1)
    );
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

  public updateCustomItemFolder(folder: CustomItemFolder): void {
    this.customItemsFacade.updateCustomItemFolder(folder);
  }

  public importItems(): void {
    //TODO
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

  private beforeSave(item: CustomItem): CustomItem {
    if (item.gatheredBy !== undefined) {
      item.gatheredBy.icon = NodeTypeIconPipe.icons[item.gatheredBy.type];
      item.gatheredBy.nodes[0].zoneid = item.gatheredBy.nodes[0].mapid;
      item.gatheredBy.nodes[0].areaid = item.gatheredBy.nodes[0].mapid;
      item.gatheredBy.nodes[0].level = item.gatheredBy.level;
    }
    return item;
  }

  /**
   * Details writing
   */
  public addGathering(item: CustomItem): void {
    item.gatheredBy = {
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
    };
    item.dirty = true;
  }

  public deleteGathering(item: CustomItem): void {
    delete item.gatheredBy;
    item.dirty = true;
  }

  public addAlarm(item: CustomItem): void {
    item.alarms = item.alarms || [];
    let componentParams: Partial<CustomAlarmPopupComponent> = { returnAlarm: true, name: item.name };
    if (item.gatheredBy !== undefined) {
      componentParams = {
        ...componentParams,
        x: item.gatheredBy.nodes[0].coords[0],
        y: item.gatheredBy.nodes[0].coords[1],
        mapId: item.gatheredBy.nodes[0].mapid,
        type: item.gatheredBy.type
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
        slot: alarm.slot,
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

  public addVendor(item: CustomItem): void {
    item.vendors = item.vendors || [];
    item.vendors.push({
      npcId: -1,
      areaId: 0,
      mapId: 1,
      coords: { x: 0, y: 0 },
      price: 1,
      zoneId: 0
    });
    item.dirty = true;
  }

  public deleteVendor(item: CustomItem, alarm: Alarm): void {
    delete item.vendors;
    item.dirty = true;
  }

}
