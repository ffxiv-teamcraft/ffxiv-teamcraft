import { Component } from '@angular/core';
import { CustomItem } from '../../../modules/custom-items/model/custom-item';
import { Observable } from 'rxjs';
import { CustomItemsFacade } from '../../../modules/custom-items/+state/custom-items.facade';
import { NzModalService } from 'ng-zorro-antd';
import { NameQuestionPopupComponent } from '../../../modules/name-question-popup/name-question-popup/name-question-popup.component';
import { filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-custom-items',
  templateUrl: './custom-items.component.html',
  styleUrls: ['./custom-items.component.less']
})
export class CustomItemsComponent {

  public customItems$: Observable<CustomItem[]> = this.customItemsFacade.allCustomItems$;

  constructor(private customItemsFacade: CustomItemsFacade, private dialog: NzModalService,
              private translate: TranslateService) {
    this.customItemsFacade.loadAll();
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

}
