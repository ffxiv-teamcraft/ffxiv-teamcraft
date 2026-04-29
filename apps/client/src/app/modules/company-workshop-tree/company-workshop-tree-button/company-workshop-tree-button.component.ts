import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CompanyWorkshopTreePopupComponent } from '../company-workshop-tree-popup/company-workshop-tree-popup.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule, NzButtonSize } from 'ng-zorro-antd/button';

@Component({
    selector: 'app-company-workshop-tree-button',
    templateUrl: './company-workshop-tree-button.component.html',
    styleUrls: ['./company-workshop-tree-button.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzButtonModule, NzWaveModule, NzTooltipModule, NzIconModule, TranslateModule]
})
export class CompanyWorkshopTreeButtonComponent {
  private dialog = inject(NzModalService);
  private translate = inject(TranslateService);


  @Input()
  recipeId: string;

  @Input()
  size: NzButtonSize = 'default';

  openPopup(): void {
    this.dialog.create({
      nzTitle: this.translate.instant('WORKSHOP_TREE.Title'),
      nzContent: CompanyWorkshopTreePopupComponent,
      nzFooter: null,
      nzData: {
        workshopRecipeId: this.recipeId
      }
    });
  }

}
