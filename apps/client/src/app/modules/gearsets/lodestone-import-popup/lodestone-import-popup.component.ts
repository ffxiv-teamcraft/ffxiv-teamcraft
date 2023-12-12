import { Component } from '@angular/core';
import { AriyalaLinkParser } from '../../../pages/lists/list-import-popup/link-parser/ariyala-link-parser';
import { GearsetsFacade } from '../+state/gearsets.facade';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { TranslateModule } from '@ngx-translate/core';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';

@Component({
    selector: 'app-lodestone-import-popup',
    templateUrl: './lodestone-import-popup.component.html',
    styleUrls: ['./lodestone-import-popup.component.less'],
    standalone: true,
    imports: [NzGridModule, NzFormModule, NzInputModule, FormsModule, NzButtonModule, NzWaveModule, TranslateModule]
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
