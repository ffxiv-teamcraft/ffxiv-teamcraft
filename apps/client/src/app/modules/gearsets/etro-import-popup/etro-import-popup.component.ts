import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GearsetsFacade } from '../+state/gearsets.facade';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { EtroImportStatic } from './etro-import-static';

@Component({
  selector: 'app-etro-import-popup',
  templateUrl: './etro-import-popup.component.html',
  styleUrls: ['./etro-import-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EtroImportPopupComponent {

  public importLink: string;

  public importLinkSupported: boolean;

  public gearsetName: string;

  constructor(private gearsetsFacade: GearsetsFacade, private modalRef: NzModalRef) {
  }

  updateLinkSupport(): void {
    if (this.importLink === undefined) {
      return;
    }
    this.importLinkSupported = EtroImportStatic.REGEXP.test(this.importLink);
  }

  submit(): void {
    this.gearsetsFacade.fromEtroLink(this.importLink)
      .subscribe(gearset => {
        gearset.name = this.gearsetName;
        this.modalRef.close(gearset);
      });
  }

}
