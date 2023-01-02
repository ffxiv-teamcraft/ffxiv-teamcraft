import { Component } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { UntypedFormControl, Validators } from '@angular/forms';
import { CharacterSearchResult, XivapiService } from '@xivapi/angular-client';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { debounceTime, filter, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';

@Component({
  selector: 'app-freecompany-picker',
  templateUrl: './freecompany-picker.component.html',
  styleUrls: ['./freecompany-picker.component.less']
})
export class FreecompanyPickerComponent {

  public servers$: Observable<string[]>;

  public autoCompleteRows$: Observable<string[]>;

  public selectedServer = new UntypedFormControl('', [Validators.required]);

  public fcName = new UntypedFormControl('');

  public lodestoneId = new UntypedFormControl(null);

  public result$: Observable<any[]>;

  public loadingResults = false;

  public currentUserFc$ = this.authFacade.fcId$.pipe(
    filter(Boolean),
    switchMap(fcId => this.xivapi.getFreeCompany(fcId)),
    map(res => res.FreeCompany)
  );

  constructor(private xivapi: XivapiService, private modalRef: NzModalRef, private authFacade: AuthFacade) {
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
        switchMap(([selectedServer, fcName]) => {
          return this.xivapi.searchFreeCompany(fcName, selectedServer);
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
