import { Component } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd';
import { EMPTY, Subscription } from 'rxjs';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { CustomItem } from '../../../modules/custom-items/model/custom-item';
import { CustomItemsFacade } from '../../../modules/custom-items/+state/custom-items.facade';
import { expand, filter, first } from 'rxjs/operators';

@Component({
  selector: 'app-custom-items-import-popup',
  templateUrl: './custom-items-import-popup.component.html',
  styleUrls: ['./custom-items-import-popup.component.less']
})
export class CustomItemsImportPopupComponent {

  public format = 'TC';

  public hideUpload = false;

  public error: string;

  public errorDetails: string;

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

  constructor(private modalRef: NzModalRef, private serializer: NgSerializerService, private customItemsFacade: CustomItemsFacade) {
  }

  private processFile(content: string): void {
    try {
      switch (this.format) {
        case 'TC':
          this.processTCImport(content);
          break;
      }
      this.modalRef.close();
    } catch (err) {
      this.error = 'CUSTOM_ITEMS.IMPORT.Corrupted_file';
      this.errorDetails = err.message;
      this.hideUpload = false;
    }
  }

  private processTCImport(content: string): void {
    const json = decodeURIComponent(escape(atob(content)));
    const data: any[] = JSON.parse(json);
    const items: CustomItem[] = this.serializer.deserialize<CustomItem>(data, [CustomItem]);
    const sortedItems = this.topologicalSort(items);
    let index = -1;
    this.customItemsFacade.allCustomItems$.pipe(
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
        delete item.$key;
        // If it has requirements, map them to the new items.
        if (item.requires !== undefined) {
          item.requires = item.requires.map(req => {
            if (!req.custom) {
              return req;
            }
            const previousReq = items.find(i => i.$key === req.id);
            const newReq = allItems.find(i => {
              return i.name === previousReq.name && i.$key !== undefined && i.createdAt === previousReq.createdAt;
            });
            req.id = newReq ? newReq.$key : 'missing item';
            return req;
          });
        }
        this.customItemsFacade.addCustomItem(item);
        return this.customItemsFacade.allCustomItems$.pipe(
          filter(availableItems => {
            return availableItems.some(i => i.name === item.name && i.$key !== undefined && i.createdAt === item.createdAt);
          }),
          first()
        );
      })
    ).subscribe(() => {
      index++;
    });
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
