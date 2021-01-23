import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CompanyWorkshopTreePopupComponent } from '../company-workshop-tree-popup/company-workshop-tree-popup.component';
import { TranslateService } from '@ngx-translate/core';
import { NzButtonSize } from 'ng-zorro-antd/button/button.component';

@Component({
  selector: 'app-company-workshop-tree-button',
  templateUrl: './company-workshop-tree-button.component.html',
  styleUrls: ['./company-workshop-tree-button.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyWorkshopTreeButtonComponent {

  @Input()
  recipeId: string;

  @Input()
  size: NzButtonSize = 'default';

  constructor(private dialog: NzModalService, private translate: TranslateService) {
  }

  openPopup(): void {
    this.dialog.create({
      nzTitle: this.translate.instant('WORKSHOP_TREE.Title'),
      nzContent: CompanyWorkshopTreePopupComponent,
      nzFooter: null,
      nzComponentParams: {
        workshopRecipeId: this.recipeId
      }
    });
  }

}
