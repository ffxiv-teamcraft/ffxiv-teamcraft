import { Component } from '@angular/core';
import { UserService } from '../../../core/database/user.service';
import { combineLatest, merge, Observable, of } from 'rxjs';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { debounceTime, map, switchMap, tap } from 'rxjs/operators';
import { UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserSearchMode } from './user-search-mode.enum';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { IntegrityCheckPopupComponent } from './integrity-check-popup/integrity-check-popup.component';
import { LodestoneService } from '../../../core/api/lodestone.service';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { User } from '@angular/fire/auth';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { CharacterNamePipe } from '../../../pipes/pipes/character-name.pipe';
import { RouterLink } from '@angular/router';
import { UserAvatarComponent } from '../../../modules/user-avatar/user-avatar/user-avatar.component';
import { FullpageMessageComponent } from '../../../modules/fullpage-message/fullpage-message/fullpage-message.component';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NgFor, NgSwitch, NgSwitchCase, NgIf, AsyncPipe } from '@angular/common';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.less'],
    standalone: true,
    imports: [FlexModule, NzGridModule, NzFormModule, NzSelectModule, FormsModule, NgFor, NgSwitch, NgSwitchCase, NzInputModule, ReactiveFormsModule, NzAutocompleteModule, NgIf, NzListModule, FullpageMessageComponent, UserAvatarComponent, RouterLink, AsyncPipe, TranslateModule, CharacterNamePipe]
})
export class UsersComponent {

  userSearchModes = Object.values(UserSearchMode);

  UserSearchMode = UserSearchMode;

  searchMode: UserSearchMode = UserSearchMode.UID;

  uidFilter = new UntypedFormControl('');

  emailFilter = new UntypedFormControl('');

  servers$: Observable<string[]>;

  autoCompleteRows$: Observable<string[]>;

  selectedServer = new UntypedFormControl('', [Validators.required]);

  characterName = new UntypedFormControl('');

  lodestoneId = new UntypedFormControl(null);

  loadingResults = false;

  results$: Observable<TeamcraftUser[]>;

  constructor(private userService: UserService, private lazyData: LazyDataFacade,
              private gcf: Functions, private modal: NzModalService,
              private translate: TranslateService, private lodestone: LodestoneService) {

    // From UID
    const usersFromUid$ = this.uidFilter.valueChanges.pipe(
      tap(() => this.loadingResults = true),
      switchMap(uid => {
        return this.userService.get(uid);
      }),
      map(user => [user].filter(u => !u.notFound)),
      tap(() => this.loadingResults = false)
    );

    // From Email
    const usersFromEmail$ = this.emailFilter.valueChanges.pipe(
      tap(() => this.loadingResults = true),
      switchMap(email => {
        return httpsCallable<{ email: string }, { record: User }>(this.gcf, 'getUserByEmail')({ email: email });
      }),
      switchMap(res => {
        if (!res?.data.record) {
          return of({ notFound: true });
        }
        return this.userService.get(res.data.record.uid);
      }),
      map(user => [user].filter(u => !u.notFound)),
      tap(() => this.loadingResults = false)
    );

    // From char name
    this.servers$ = this.lazyData.servers$;

    this.autoCompleteRows$ = combineLatest([this.servers$, this.selectedServer.valueChanges])
      .pipe(
        map(([servers, inputValue]) => {
          return servers.filter(server => server.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
        })
      );

    const usersFromCharName$ = combineLatest([this.selectedServer.valueChanges, this.characterName.valueChanges])
      .pipe(
        tap(() => this.loadingResults = true),
        debounceTime(500),
        switchMap(([selectedServer, characterName]) => {
          return this.lodestone.searchCharacter(characterName, selectedServer);
        }),
        switchMap(results => {
          if (results.length === 0) {
            return of([]);
          }
          return combineLatest(
            results.map(c => {
              return this.userService.getUsersByLodestoneId(c.ID);
            })
          ).pipe(
            map(res => {
              return [].concat.apply([], res);
            })
          );
        }),
        tap(() => this.loadingResults = false)
      );

    // From lodestone ID
    const usersFromLodestoneID$ = this.lodestoneId.valueChanges.pipe(
      tap(() => this.loadingResults = true),
      switchMap(lodestoneId => this.userService.getUsersByLodestoneId(lodestoneId)),
      tap(() => this.loadingResults = false)
    );

    this.results$ = merge(
      usersFromUid$,
      usersFromEmail$,
      usersFromCharName$,
      usersFromLodestoneID$
    );
  }

  runIntegrityCheck(user: TeamcraftUser): void {
    this.modal.create({
      nzTitle: this.translate.instant('ADMIN.USERS.Integrity_check'),
      nzContent: IntegrityCheckPopupComponent,
      nzFooter: null,
      nzComponentParams: {
        user: user
      }
    });
  }

}
