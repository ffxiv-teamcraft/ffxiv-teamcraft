import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { AuthFacade } from '../../../+state/auth.facade';
import { SettingsService } from '../../settings/settings.service';
import { TranslateModule } from '@ngx-translate/core';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-content-id-linking-popup',
    templateUrl: './content-id-linking-popup.component.html',
    styleUrls: ['./content-id-linking-popup.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, NgFor, NgIf, NzToolTipModule, NzPopconfirmModule, NzAvatarModule, NzTagModule, NzButtonModule, NzWaveModule, NzIconModule, NzDividerModule, AsyncPipe, TranslateModule]
})
export class ContentIdLinkingPopupComponent {

  contentId: string;

  previousContentId: string;

  characterEntries$ = this.authFacade.characterEntries$;

  constructor(private authFacade: AuthFacade, private settings: SettingsService,
              private modalRef: NzModalRef) {
  }

  selectCharacter(id: number): void {
    this.authFacade.setContentId(id, this.contentId);
    this.modalRef.close(this.contentId);
  }

  addNewCharacter(): void {
    this.authFacade.addCharacter(false, false);
  }

  ignoreContentId(): void {
    this.settings.ignoredContentIds = [
      ...this.settings.ignoredContentIds,
      this.contentId
    ];
    this.modalRef.close(this.previousContentId);
  }

}
