import { Component } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { FormControl, Validators } from '@angular/forms';
import { CharacterSearchResult, CharacterSearchResultRow, XivapiService } from '@xivapi/angular-client';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { debounceTime, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { UserService } from '../../../core/database/user.service';

@Component({
  selector: 'app-freecompany-picker',
  templateUrl: './freecompany-picker.component.html',
  styleUrls: ['./freecompany-picker.component.less']
})
export class FreecompanyPickerComponent {

  public servers$: Observable<string[]>;

  public autoCompleteRows$: Observable<string[]>;

  public selectedServer = new FormControl('', [Validators.required]);

  public fcName = new FormControl('');

  public lodestoneId = new FormControl(null);

  public result$: Observable<any[]>;

  public loadingResults = false;

  constructor(private xivapi: XivapiService, private modalRef: NzModalRef) {
    this.servers$ = this.xivapi.getServerList().pipe(shareReplay({ bufferSize: 1, refCount: true }));

    this.autoCompleteRows$ = combineLatest([this.servers$, this.selectedServer.valueChanges])
      .pipe(
        map(([servers, inputValue]) => {
          return servers.filter(server => server.indexOf(inputValue) > -1);
        })
      );

    this.result$ = combineLatest([this.selectedServer.valueChanges, this.fcName.valueChanges])
      .pipe(
        tap(() => this.loadingResults = true),
        debounceTime(500),
        switchMap(([selectedServer, characterName]) => {
          return this.xivapi.searchFreeCompany(characterName, selectedServer);
        }),
        map((result: CharacterSearchResult) => result.Results || []),
        tap(() => this.loadingResults = false),
        startWith([])
      );
  }

  pickFc(row: any): void {
    this.modalRef.close(row.ID);
  }

}
