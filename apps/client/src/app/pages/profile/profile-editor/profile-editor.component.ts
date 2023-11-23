import { ChangeDetectorRef, Component } from '@angular/core';
import { AuthFacade } from '../../../+state/auth.facade';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { filter, first, map, shareReplay } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { MasterbooksPopupComponent } from './masterbooks-popup/masterbooks-popup.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { StatsPopupComponent } from './stats-popup/stats-popup.component';
import { UserPickerService } from '../../../modules/user-picker/user-picker.service';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { VerificationPopupComponent } from './verification-popup/verification-popup.component';
import { IpcService } from '../../../core/electron/ipc.service';
import { AutofillStatsPopupComponent } from './autofill-stats-popup/autofill-stats-popup.component';
import { TeamcraftGearsetStats } from '../../../model/user/teamcraft-gearset-stats';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { JobUnicodePipe } from '../../../pipes/pipes/job-unicode.pipe';
import { CharacterNamePipe } from '../../../pipes/pipes/character-name.pipe';
import { IfMobilePipe } from '../../../pipes/pipes/if-mobile.pipe';
import { UserAvatarComponent } from '../../../modules/user-avatar/user-avatar/user-avatar.component';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { RouterLink } from '@angular/router';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-profile-editor',
    templateUrl: './profile-editor.component.html',
    styleUrls: ['./profile-editor.component.less'],
    standalone: true,
    imports: [NgIf, FlexModule, NzAvatarModule, NzSelectModule, FormsModule, NgFor, NzButtonModule, NzIconModule, NzToolTipModule, NzWaveModule, RouterLink, NzTagModule, NzGridModule, NzCardModule, NzListModule, NzSliderModule, NzPopconfirmModule, UserAvatarComponent, AsyncPipe, TranslateModule, IfMobilePipe, CharacterNamePipe, JobUnicodePipe, I18nPipe, I18nRowPipe]
})
export class ProfileEditorComponent {

  user$ = this.authFacade.user$;

  userId$ = this.authFacade.userId$;

  mainCharacter$ = this.authFacade.mainCharacterEntry$;

  characters$ = combineLatest([this.authFacade.characters$, this.authFacade.user$]).pipe(
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
    shareReplay({ bufferSize: 1, refCount: true })
  );

  charactersForManagement$ = combineLatest([this.authFacade.characters$, this.authFacade.user$]).pipe(
    map(([chars, user]) => {
      return user.lodestoneIds
        .map(lodestoneIdEntry => {
          const character = chars.find(c => c.Character.ID === lodestoneIdEntry.id);
          return {
            ...lodestoneIdEntry,
            character
          };
        });
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  gearSets$ = this.authFacade.gearSets$;

  now = Math.floor(Date.now() / 1000);

  private statsReloader$ = new BehaviorSubject(null);

  constructor(private authFacade: AuthFacade, private dialog: NzModalService, private translate: TranslateService,
              private userPicker: UserPickerService, public ipc: IpcService, private cdr: ChangeDetectorRef) {
  }

  saveSet(set: TeamcraftGearsetStats): void {
    this.authFacade.saveSet(set);
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
    }).afterClose
      .subscribe(() => {
        this.statsReloader$.next(null);
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
      })
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
