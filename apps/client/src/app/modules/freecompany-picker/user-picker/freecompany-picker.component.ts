import { Component } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { debounceTime, filter, map, startWith, switchMap, tap } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LodestoneService } from '../../../core/api/lodestone.service';
import { TranslateModule } from '@ngx-translate/core';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzListModule } from 'ng-zorro-antd/list';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';

@Component({
    selector: 'app-freecompany-picker',
    templateUrl: './freecompany-picker.component.html',
    styleUrls: ['./freecompany-picker.component.less'],
    standalone: true,
    imports: [NzGridModule, NzFormModule, NzInputModule, FormsModule, NzAutocompleteModule, ReactiveFormsModule, NgFor, NgIf, NzListModule, NzButtonModule, NzWaveModule, AsyncPipe, TranslateModule]
})
export class FreecompanyPickerComponent {

  public servers$ = this.lazyData.servers$;

  public autoCompleteRows$: Observable<string[]>;

  public selectedServer = new UntypedFormControl('', [Validators.required]);

  public fcName = new UntypedFormControl('');

  public lodestoneId = new UntypedFormControl(null);

  public result$ = combineLatest([this.selectedServer.valueChanges, this.fcName.valueChanges])
    .pipe(
      tap(() => this.loadingResults = true),
      debounceTime(500),
      switchMap(([selectedServer, fcName]) => {
        return this.lodestone.searchFreeCompany(fcName, selectedServer);
      }),
      map((result) => result.List || []),
      tap(() => this.loadingResults = false),
      startWith([])
    );

  public loadingResults = false;

  public currentUserFc$ = this.authFacade.fcId$.pipe(
    filter(Boolean),
    switchMap(fcId => this.lodestone.getFreeCompany(fcId)),
    map(res => res.FreeCompany)
  );

  constructor(private lodestone: LodestoneService, private lazyData: LazyDataFacade, private modalRef: NzModalRef, private authFacade: AuthFacade) {
    this.autoCompleteRows$ = combineLatest([this.servers$, this.selectedServer.valueChanges])
      .pipe(
        map(([servers, inputValue]) => {
          return servers.filter(server => server.indexOf(inputValue) > -1);
        })
      );
  }

  pickFc(row: any): void {
    this.modalRef.close(row.ID);
  }

}
