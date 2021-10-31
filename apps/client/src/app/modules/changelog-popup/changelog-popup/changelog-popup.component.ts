import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-changelog-popup',
  templateUrl: './changelog-popup.component.html',
  styleUrls: ['./changelog-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangelogPopupComponent implements OnInit {
  public patchNotes = environment.patchNotes;

  constructor(private modalRef: NzModalRef) {
  }

  ngOnInit(): void {
    if (this.patchNotes.replace(/\s/gm, '').length === 0) {
      this.modalRef.close();
    }
  }
}
