import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { WorkshopsFacade } from '../../../modules/workshop/+state/workshops.facade';
import { AbstractListsSelectionPopupComponent } from '../abstract-lists-selection-popup.component';
import { AuthFacade } from '../../../+state/auth.facade';
import { TranslateModule } from '@ngx-translate/core';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { FormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NgForTrackByKeyDirective } from '../../../core/track-by/ng-for-track-by-key.directive';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, NgTemplateOutlet, NgFor, AsyncPipe, UpperCasePipe } from '@angular/common';

@Component({
    selector: 'app-delete-multiple-lists-popup',
    templateUrl: './delete-multiple-lists-popup.component.html',
    styleUrls: ['./delete-multiple-lists-popup.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, NgTemplateOutlet, NgFor, FlexModule, NzButtonModule, NzWaveModule, NzPopconfirmModule, NzListModule, NgForTrackByKeyDirective, NzCheckboxModule, FormsModule, NzTagModule, NzToolTipModule, AsyncPipe, UpperCasePipe, TranslateModule]
})
export class DeleteMultipleListsPopupComponent extends AbstractListsSelectionPopupComponent {

  public userId$ = this.authFacade.userId$;

  constructor(listsFacade: ListsFacade, private modalRef: NzModalRef,
              workshopsFacade: WorkshopsFacade, private authFacade: AuthFacade) {
    super(listsFacade, workshopsFacade);
  }

  public deleteLists(): void {
    this.listsFacade.deleteLists(this.selectedLists.map(l => l.$key));
    this.modalRef.close();
  }

}
