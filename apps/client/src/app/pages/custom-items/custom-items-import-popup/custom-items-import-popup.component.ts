import { Component } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { EMPTY, Observable, Subscription } from 'rxjs';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { CustomItem } from '../../../modules/custom-items/model/custom-item';
import { CustomItemsFacade } from '../../../modules/custom-items/+state/custom-items.facade';
import { expand, filter, first, skip, tap } from 'rxjs/operators';
import { CustomItemFolder } from '../../../modules/custom-items/model/custom-item-folder';
import { DataService } from '../../../core/api/data.service';
import { Ingredient } from '../../../model/garland-tools/ingredient';
import { DataType } from '../../../modules/list/data/data-type';
import { getItemSource } from '../../../modules/list/model/list-row';
import { EnvironmentService } from '../../../core/environment.service';

@Component({
  selector: 'app-custom-items-import-popup',
  templateUrl: './custom-items-import-popup.component.html',
  styleUrls: ['./custom-items-import-popup.component.less']
})
export class CustomItemsImportPopupComponent {

  public format = 'TC';

  public folder: CustomItemFolder;

  public hideUpload = false;

  public error: string;

  public errorDetails: string;

  public folders$: Observable<CustomItemFolder[]> = this.customItemsFacade.allCustomItemFolders$;

  public availableCraftJobs: any[] = [];

  public state: 'PARSING' | 'SAVING' = 'PARSING';

  public totalSaving = 1;

  public savingDone = 0;

  constructor(private modalRef: NzModalRef, private serializer: NgSerializerService, private customItemsFacade: CustomItemsFacade,
              private env: EnvironmentService) {
  }

  public handleFile = (event: any) => {
    delete this.error;
    delete this.errorDetails;
    const reader = new FileReader();
    let data = '';
    reader.onload = ((_) => {
      return (e) => {
        data += e.target.result;
      };
    })(event.file);
    reader.onloadend = () => {
      this.processFile(data);
    };
    // Read in the image file as a data URL.
    reader.readAsText(event.file);
    this.hideUpload = true;
    return new Subscription();
  };

  public getAccept(): string {
    switch (this.format) {
      case 'TC':
        return '.tcitem';
      default:
        return '';
    }
  }

  private processFile(content: string): void {
    try {
      let operation$: Observable<any>;
      switch (this.format) {
        case 'TC':
          operation$ = this.processTCImport(content);
          break;
      }
      operation$.pipe(first()).subscribe(() => {
        this.modalRef.close();
      });
    } catch (err) {
      this.error = 'CUSTOM_ITEMS.IMPORT.Corrupted_file';
      this.errorDetails = err.message;
      this.hideUpload = false;
    }
  }

  private processTCImport(content: string): Observable<any> {
    const json = decodeURIComponent(escape(atob(content)));
    const data: any[] = JSON.parse(json);
    const items: CustomItem[] = this.serializer
      .deserialize<CustomItem>(data, [CustomItem])
      .map(item => {
        item.afterDeserialized();
        return item;
      });
    const sortedItems = this.topologicalSort(items);
    let index = -1;
    this.totalSaving = sortedItems.length;
    return this.customItemsFacade.allCustomItems$.pipe(
      first(),
      expand((allItems) => {
        if (sortedItems[index] === undefined) {
          return EMPTY;
        }
        const itemData = sortedItems[index];
        const item = new CustomItem();
        Object.assign(item, itemData);
        delete item.authorId;
        delete item.folderId;
        item.$key = this.customItemsFacade.createId();
        // If it has requirements, map them to the new items.
        if (item.requires !== undefined) {
          item.requires = item.requires.map(req => {
            if (!req.custom) {
              return req;
            }
            const previousReq = items.find(i => i.$key === req.id);
            const newReq = allItems.find(i => {
              return i.name === previousReq.name && i.$key !== undefined && i.createdAt.toMillis() === previousReq.createdAt.toMillis();
            });
            req.id = newReq ? newReq.$key : 'missing item';
            return req;
          });
        }
        this.customItemsFacade.addCustomItem(item);
        if (this.folder !== undefined) {
          this.folder.items.push(item.$key);
          this.customItemsFacade.updateCustomItemFolder(this.folder);
        }
        return this.customItemsFacade.allCustomItems$.pipe(
          filter(availableItems => {
            return availableItems.some(i => i.name === item.name && i.$key !== undefined && i.createdAt.toMillis() === item.createdAt.toMillis());
          }),
          first()
        );
      }),
      tap(() => {
        this.savingDone++;
        index++;
      }),
      skip(sortedItems.length - 1)
    );
  }

  private topologicalSort(data: CustomItem[]): CustomItem[] {
    const res: CustomItem[] = [];
    const doneList: boolean[] = [];
    while (data.length > res.length) {
      let resolved = false;

      for (const item of data) {
        if (res.indexOf(item) > -1) {
          // item already in resultset
          continue;
        }
        resolved = true;

        if (item.requires !== undefined) {
          for (const dep of item.requires) {
            // We have to check if it's not a precraft, as some dependencies aren't resolvable inside the current array.
            const depIsInArray = data.find(row => row.id === dep.id) !== undefined;
            if (!doneList[dep.id] && depIsInArray) {
              // there is a dependency that is not met:
              resolved = false;
              break;
            }
          }
        }
        if (resolved) {
          // All dependencies are met:
          doneList[item.id] = true;
          res.push(item);
        }
      }
    }
    return res;
  }

}
