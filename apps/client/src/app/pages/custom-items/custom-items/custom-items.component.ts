import { Component } from '@angular/core';
import { CustomItem } from '../../../modules/custom-items/model/custom-item';
import { combineLatest, Observable } from 'rxjs';
import { CustomItemsFacade } from '../../../modules/custom-items/+state/custom-items.facade';
import { NzModalService } from 'ng-zorro-antd';
import { NameQuestionPopupComponent } from '../../../modules/name-question-popup/name-question-popup/name-question-popup.component';
import { filter, map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { CustomItemFolder } from '../../../modules/custom-items/model/custom-item-folder';
import { CustomItemsDisplay } from '../../../modules/custom-items/+state/custom-items-display';

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
    this.customItemsFacade.updateCustomItem(item);
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

}
