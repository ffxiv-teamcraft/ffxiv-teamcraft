import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GearsetsFacade } from '../+state/gearsets.facade';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { EtroImportStatic } from './etro-import-static';
import { TranslateModule } from '@ngx-translate/core';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';

@Component({
    selector: 'app-etro-import-popup',
    templateUrl: './etro-import-popup.component.html',
    styleUrls: ['./etro-import-popup.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzGridModule, NzFormModule, NzInputModule, FormsModule, NgIf, NzButtonModule, NzWaveModule, TranslateModule]
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
