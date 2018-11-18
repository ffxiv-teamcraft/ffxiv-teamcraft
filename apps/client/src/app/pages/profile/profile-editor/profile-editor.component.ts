import { Component } from '@angular/core';
import { AuthFacade } from '../../../+state/auth.facade';
import { combineLatest } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd';
import { MasterbooksPopupComponent } from './masterbooks-popup/masterbooks-popup.component';
import { TranslateService } from '@ngx-translate/core';
import { StatsPopupComponent } from './stats-popup/stats-popup.component';

@Component({
  selector: 'app-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.less']
})
export class ProfileEditorComponent {

  user$ = this.authFacade.user$;

  mainCharacter$ = this.authFacade.mainCharacterEntry$;

  characters$ = combineLatest(this.authFacade.characters$, this.authFacade.user$).pipe(
    map(([chars, user]) => {
      return chars
        .map(char => {
          const lodestoneIdEntry = user.lodestoneIds.find(entry => entry.id === char.Character.ID);
          return {
            ...lodestoneIdEntry,
            character: char
          };
        });
    }),
    shareReplay(1)
  );

  gearSets$ = this.authFacade.gearSets$;

  constructor(private authFacade: AuthFacade, private dialog: NzModalService, private translate: TranslateService) {
  }

  addCharacter(): void {
    this.authFacade.addCharacter();
  }

  removeCharacter(id: number): void {
    this.authFacade.removeCharacter(id);
  }

  editMasterbooks(jobId: number): void {
    this.dialog.create({
      nzContent: MasterbooksPopupComponent,
      nzComponentParams: {
        jobId: jobId
      },
      nzFooter: null,
      nzTitle: this.translate.instant('PROFILE.Masterbooks')
    });
  }

  editStats(jobId: number): void {
    this.dialog.create({
      nzContent: StatsPopupComponent,
      nzComponentParams: {
        jobId: jobId
      },
      nzFooter: null,
      nzTitle: this.translate.instant('PROFILE.Stats')
    });
  }

  setDefaultCharacter(lodestoneId: number): void {
    this.authFacade.setDefaultCharacter(lodestoneId);
  }

}
