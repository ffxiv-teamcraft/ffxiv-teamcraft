import { Component } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CharacterSearchResultRow } from '@xivapi/angular-client';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { debounceTime, map, switchMap, tap } from 'rxjs/operators';
import { UserService } from '../../../core/database/user.service';
import { AuthFacade } from '../../../+state/auth.facade';
import { LodestoneService } from '../../../core/api/lodestone.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { CharacterNamePipe } from '../../../pipes/pipes/character-name.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { UserAvatarComponent } from '../../user-avatar/user-avatar/user-avatar.component';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzListModule } from 'ng-zorro-antd/list';
import { PageLoaderComponent } from '../../page-loader/page-loader/page-loader.component';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-user-picker',
    templateUrl: './user-picker.component.html',
    styleUrls: ['./user-picker.component.less'],
    standalone: true,
    imports: [NgIf, NzGridModule, NzFormModule, NzInputModule, FormsModule, NzAutocompleteModule, ReactiveFormsModule, NgFor, PageLoaderComponent, NzListModule, NzButtonModule, NzWaveModule, UserAvatarComponent, NzDividerModule, NzSpinModule, AsyncPipe, TranslateModule, CharacterNamePipe]
})
export class UserPickerComponent {

  public servers$ = this.lazyData.servers$;

  public autoCompleteRows$: Observable<string[]>;

  public selectedServer = new UntypedFormControl('', [Validators.required]);

  public characterName = new UntypedFormControl('');

  public lodestoneId = new UntypedFormControl(null);

  public result$: Observable<CharacterSearchResultRow[]>;

  public loadingResults = false;

  public hideContacts = false;

  public contacts$ = this.authFacade.user$.pipe(
    map(user => user.contacts)
  );

  constructor(private lazyData: LazyDataFacade, private lodestone: LodestoneService, private modalRef: NzModalRef,
              private userService: UserService, private authFacade: AuthFacade) {

    this.autoCompleteRows$ = combineLatest([this.servers$, this.selectedServer.valueChanges])
      .pipe(
        map(([servers, inputValue]) => {
          return servers.filter(server => server.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
        })
      );

    this.result$ = combineLatest([this.selectedServer.valueChanges, this.characterName.valueChanges])
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
              return this.userService.getUsersByLodestoneId(c.ID)
                .pipe(
                  map(users => {
                    return users.map(user => {
                      return {
                        userId: user.$key,
                        characterName: c.Name,
                        characterAvatar: c.Avatar
                      };
                    });
                  })
                );
            })
          ).pipe(map(res => [].concat.apply([], res)));
        }),
        tap(() => this.loadingResults = false)
      );
  }

  pickUser(row: any): void {
    this.modalRef.close(row.userId);
  }

}
