import { Component } from '@angular/core';
import { AriyalaLinkParser } from '../../../pages/lists/list-import-popup/link-parser/ariyala-link-parser';
import { GearsetsFacade } from '../+state/gearsets.facade';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { TranslateModule } from '@ngx-translate/core';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';

@Component({
    selector: 'app-ariyala-import-popup',
    templateUrl: './ariyala-import-popup.component.html',
    styleUrls: ['./ariyala-import-popup.component.less'],
    standalone: true,
    imports: [NzGridModule, NzFormModule, NzInputModule, FormsModule, NgIf, NzButtonModule, NzWaveModule, TranslateModule]
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
