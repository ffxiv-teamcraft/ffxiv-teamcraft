import { Component } from '@angular/core';
import { AuthFacade } from '../../../+state/auth.facade';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { filter, first, map, shareReplay, switchMapTo } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd';
import { MasterbooksPopupComponent } from './masterbooks-popup/masterbooks-popup.component';
import { TranslateService } from '@ngx-translate/core';
import { StatsPopupComponent } from './stats-popup/stats-popup.component';
import { UserPickerService } from '../../../modules/user-picker/user-picker.service';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { VerificationPopupComponent } from './verification-popup/verification-popup.component';
import { CharacterResponse } from '@xivapi/angular-client';
import { IpcService } from '../../../core/electron/ipc.service';
import { AutofillStatsPopupComponent } from './autofill-stats-popup/autofill-stats-popup.component';

@Component({
  selector: 'app-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.less']
})
export class ProfileEditorComponent {

  private statsReloader$ = new BehaviorSubject(null);

  user$ = this.authFacade.user$;

  userId$ = this.authFacade.userId$;

  mainCharacter$ = this.authFacade.mainCharacterEntry$;

  characters$ = combineLatest([this.authFacade.characters$, this.authFacade.user$]).pipe(
    map(([chars, user]) => {
      return chars
        .concat(<CharacterResponse[]>(user.customCharacters.map(c => ({ Character: c })) || []))
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

  gearSets$ = this.statsReloader$.pipe(switchMapTo(this.authFacade.gearSets$));

  now = Math.floor(Date.now() / 1000);

  constructor(private authFacade: AuthFacade, private dialog: NzModalService, private translate: TranslateService,
              private userPicker: UserPickerService, public ipc: IpcService) {
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

  openAutoFillPopup(): void {
    this.dialog.create({
      nzContent: AutofillStatsPopupComponent,
      nzFooter: null,
      nzTitle: this.translate.instant('PROFILE.Autofill_from_packets')
    }).afterClose
      .subscribe(() => {
        this.statsReloader$.next(null);
      });
  }

  newContact(user: TeamcraftUser): void {
    this.userPicker.pickUserId(true).pipe(
      filter(userId => {
        return userId !== undefined && (user.contacts || []).indexOf(userId) === -1;
      }),
      first()
    ).subscribe(contactId => {
      if (user.contacts === undefined) {
        user.contacts = [];
      }
      user.contacts.push(contactId);
      this.authFacade.updateUser(user);
    });
  }

  verifyCharacter(userId: string, lodestoneId: number): void {
    this.dialog.create({
      nzContent: VerificationPopupComponent,
      nzComponentParams: {
        verificationCode: userId,
        lodestoneId: lodestoneId
      },
      nzFooter: null,
      nzTitle: this.translate.instant('PROFILE.VERIFICATION.Title')
    });
  }

  removeContact(user: TeamcraftUser, contactId: string): void {
    user.contacts = user.contacts.filter(c => c !== contactId);
    this.authFacade.updateUser(user);
  }

  setDefaultCharacter(lodestoneId: number): void {
    this.authFacade.setDefaultCharacter(lodestoneId);
  }

}
