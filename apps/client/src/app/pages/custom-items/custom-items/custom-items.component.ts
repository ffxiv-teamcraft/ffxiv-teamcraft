import { Component } from '@angular/core';
import { CustomItem } from '../../../modules/custom-items/model/custom-item';
import { combineLatest, Observable } from 'rxjs';
import { CustomItemsFacade } from '../../../modules/custom-items/+state/custom-items.facade';
import { NzModalService } from 'ng-zorro-antd';
import { NameQuestionPopupComponent } from '../../../modules/name-question-popup/name-question-popup/name-question-popup.component';
import { filter, first, map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { CustomItemFolder } from '../../../modules/custom-items/model/custom-item-folder';
import { CustomItemsDisplay } from '../../../modules/custom-items/+state/custom-items-display';
import { DataModel } from '../../../core/database/storage/data-model';
import { NodeTypeIconPipe } from '../../../pipes/node-type-icon.pipe';
import { folklores } from '../../../core/data/sources/folklores';

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

  constructor(private customItemsFacade: CustomItemsFacade, private dialog: NzModalService,
              private translate: TranslateService) {
    this.customItemsFacade.loadAll();
    this.customItemsFacade.loadAllFolders();
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
      nodes: [],
      stars_tooltip: ''
    };
  }

}
