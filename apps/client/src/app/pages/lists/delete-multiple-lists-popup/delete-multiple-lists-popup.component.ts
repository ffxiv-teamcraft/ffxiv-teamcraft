import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { WorkshopsFacade } from '../../../modules/workshop/+state/workshops.facade';
import { AbstractListsSelectionPopupComponent } from '../abstract-lists-selection-popup.component';
import { AuthFacade } from '../../../+state/auth.facade';

@Component({
  selector: 'app-delete-multiple-lists-popup',
  templateUrl: './delete-multiple-lists-popup.component.html',
  styleUrls: ['./delete-multiple-lists-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
