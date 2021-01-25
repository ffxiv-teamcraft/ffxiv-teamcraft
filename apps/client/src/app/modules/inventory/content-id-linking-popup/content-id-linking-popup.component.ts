import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { AuthFacade } from '../../../+state/auth.facade';
import { SettingsService } from '../../settings/settings.service';
import { InventoryFacade } from '../+state/inventory.facade';

@Component({
  selector: 'app-content-id-linking-popup',
  templateUrl: './content-id-linking-popup.component.html',
  styleUrls: ['./content-id-linking-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentIdLinkingPopupComponent {

  contentId: string;

  previousContentId: string;

  characterEntries$ = this.authFacade.characterEntries$;

  constructor(private authFacade: AuthFacade, private settings: SettingsService,
              private modalRef: NzModalRef, private inventoryFacade: InventoryFacade) {
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
    this.inventoryFacade.setContentId(this.previousContentId);
    this.modalRef.close(false);
  }

}
