import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { AuthFacade } from '../../../+state/auth.facade';
import { SettingsService } from '../../settings/settings.service';

@Component({
  selector: 'app-content-id-linking-popup',
  templateUrl: './content-id-linking-popup.component.html',
  styleUrls: ['./content-id-linking-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentIdLinkingPopupComponent {

  contentId: string;

  characterEntries$ = this.authFacade.characterEntries$;

  constructor(private authFacade: AuthFacade, private settings: SettingsService,
              private modalRef: NzModalRef) {
  }

  selectCharacter(id: number): void {
    this.authFacade.setContentId(id, this.contentId);
    this.modalRef.close(true);
  }

  addNewCharacter(): void {
    this.authFacade.addCharacter(false, false);
  }

  ignoreContentId(): void {
    this.settings.ignoredContentIds = [
      ...this.settings.ignoredContentIds,
      this.contentId
    ];
    this.modalRef.close(false);
  }

}
