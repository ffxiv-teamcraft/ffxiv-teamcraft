import { Component } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { FormControl, Validators } from '@angular/forms';
import { CharacterSearchResultRow, XivapiService } from '@xivapi/angular-client';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { debounceTime, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { UserService } from '../../../core/database/user.service';
import { AuthFacade } from '../../../+state/auth.facade';
import { LodestoneService } from '../../../core/api/lodestone.service';

@Component({
  selector: 'app-user-picker',
  templateUrl: './user-picker.component.html',
  styleUrls: ['./user-picker.component.less']
})
export class UserPickerComponent {

  public servers$: Observable<string[]>;

  public autoCompleteRows$: Observable<string[]>;

  public selectedServer = new FormControl('', [Validators.required]);

  public characterName = new FormControl('');

  public lodestoneId = new FormControl(null);

  public result$: Observable<CharacterSearchResultRow[]>;

  public loadingResults = false;

  public hideContacts = false;

  public contacts$ = this.authFacade.user$.pipe(
    map(user => user.contacts)
  );

  constructor(private xivapi: XivapiService, private lodestone: LodestoneService, private modalRef: NzModalRef,
              private userService: UserService, private authFacade: AuthFacade) {
    this.servers$ = this.xivapi.getServerList().pipe(shareReplay({ bufferSize: 1, refCount: true }));

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
