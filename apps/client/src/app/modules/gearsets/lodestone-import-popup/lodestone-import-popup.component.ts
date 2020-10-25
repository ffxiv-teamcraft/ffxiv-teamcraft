import { Component } from '@angular/core';
import { AriyalaLinkParser } from '../../../pages/lists/list-import-popup/link-parser/ariyala-link-parser';
import { GearsetsFacade } from '../+state/gearsets.facade';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-lodestone-import-popup',
  templateUrl: './lodestone-import-popup.component.html',
  styleUrls: ['./lodestone-import-popup.component.less']
})
export class LodestoneImportPopupComponent {

  public lodestoneId: string;

  constructor(private gearsetsFacade: GearsetsFacade, private modalRef: NzModalRef) {
  }

  submit(): void {
    this.gearsetsFacade.fromLodestone(+this.lodestoneId)
      .subscribe(gearset => {
        this.modalRef.close(gearset);
      });
  }

}
