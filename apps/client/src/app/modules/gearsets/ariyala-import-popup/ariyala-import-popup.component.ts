import { Component } from '@angular/core';
import { AriyalaLinkParser } from '../../../pages/lists/list-import-popup/link-parser/ariyala-link-parser';
import { GearsetsFacade } from '../+state/gearsets.facade';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-ariyala-import-popup',
  templateUrl: './ariyala-import-popup.component.html',
  styleUrls: ['./ariyala-import-popup.component.less']
})
export class AriyalaImportPopupComponent {

  public importLink: string;

  public importLinkSupported: boolean;

  public gearsetName: string;

  constructor(private gearsetsFacade: GearsetsFacade, private modalRef: NzModalRef) {
  }

  updateLinkSupport(): void {
    if (this.importLink === undefined) {
      return;
    }
    this.importLinkSupported = AriyalaLinkParser.REGEXP.test(this.importLink);
  }

  submit(): void {
    this.gearsetsFacade.fromAriyalaLink(this.importLink)
      .subscribe(gearset => {
        gearset.name = this.gearsetName;
        this.modalRef.close(gearset);
      });
  }

}
