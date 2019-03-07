import { Component } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd';
import { Subscription } from 'rxjs';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { CustomItem } from '../../../modules/custom-items/model/custom-item';
import { CustomItemsFacade } from '../../../modules/custom-items/+state/custom-items.facade';

@Component({
  selector: 'app-custom-items-import-popup',
  templateUrl: './custom-items-import-popup.component.html',
  styleUrls: ['./custom-items-import-popup.component.less']
})
export class CustomItemsImportPopupComponent {

  public format = 'TC';

  public hideUpload = false;

  public error: string;

  public handleFile = (event: any) => {
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
    } catch (_) {
      this.error = 'CUSTOM_ITEMS.IMPORT.Corrupted_file';
      this.hideUpload = false;
    }
  }

  private processTCImport(content: string): void {
    const json = atob(content);
    const data: any[] = JSON.parse(json);
    const items: CustomItem[] = this.serializer.deserialize<CustomItem>(data, [CustomItem]);
    items.forEach(item => {
      delete item.authorId;
      delete item.folderId;
      delete item.$key;
      this.customItemsFacade.addCustomItem(item);
    });
  }

}
