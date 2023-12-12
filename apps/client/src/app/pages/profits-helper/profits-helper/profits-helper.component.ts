import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProfitsService } from '../profits.service';
import { LocalStorageBehaviorSubject } from '../../../core/rxjs/local-storage-behavior-subject';
import { AuthFacade } from '../../../+state/auth.facade';
import { first, map, pluck, shareReplay, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, merge, Subject } from 'rxjs';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ListRow } from '../../../modules/list/model/list-row';
import { ProfitEntry } from '../model/profit-entry';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ListAdditionRecord } from '../../../modules/list-picker/list-addition-record';
import { SettingsService } from '../../../modules/settings/settings.service';
import { JobUnicodePipe } from '../../../pipes/pipes/job-unicode.pipe';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { FormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { MarketboardIconComponent } from '../../../modules/marketboard/marketboard-icon/marketboard-icon.component';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { NgIf, NgFor, NgTemplateOutlet, AsyncPipe, DecimalPipe, DatePipe } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-profits-helper',
    templateUrl: './profits-helper.component.html',
    styleUrls: ['./profits-helper.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, NzButtonModule, NzWaveModule, NzToolTipModule, NzIconModule, NzTableModule, NgIf, NgFor, ItemIconComponent, I18nNameComponent, MarketboardIconComponent, NzSpinModule, NzGridModule, NzCardModule, NzCheckboxModule, FormsModule, NgTemplateOutlet, NzInputNumberModule, NzEmptyModule, AsyncPipe, DecimalPipe, DatePipe, TranslateModule, JobUnicodePipe]
})
export class ProfitsHelperComponent {

  loadingCrafting = false;

  loadingGathering = false;

  selfSufficient$ = new LocalStorageBehaviorSubject('profits:self-sufficient', true);

  levels$ = this.authFacade.gearSets$.pipe(
    map(gearsets => {
      return gearsets.sort((a, b) => a.jobId - b.jobId).map(row => row.level);
    }),
    first()
  );

  serverFromCharacter$ = this.authFacade.mainCharacter$.pipe(
    map(character => {
      return character.Server;
    }),
    first()
  );

  serverFromInput$ = new Subject<string>();

  server$ = merge(this.serverFromCharacter$, this.serverFromInput$);

  reloader$ = new BehaviorSubject<void>(void 0);

  craftsData$ = combineLatest([
    this.server$,
    this.levels$,
    this.selfSufficient$,
    this.reloader$
  ]).pipe(
    switchMap(([server, levels, selfSufficient]) => {
      this.loadingCrafting = true;
      return this.profitsService.getCraftingProfit(server, levels, selfSufficient, 10, 100);
    }),
    tap(() => {
      this.loadingCrafting = false;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  lastUpdated$ = this.craftsData$.pipe(
    map(res => res.updated)
  );

  crafts$ = this.craftsData$.pipe(
    pluck('items')
  );

  gatherings$ = combineLatest([
    this.server$,
    this.levels$,
    this.reloader$
  ]).pipe(
    switchMap(([server, levels]) => {
      this.loadingGathering = true;
      return this.profitsService.getGatheringProfit(server, levels, 10).pipe(
        pluck('items')
      );
    }),
    tap(() => {
      this.loadingGathering = false;
    })
  );

  list: ListAdditionRecord[] = [];

  itemsInList: Record<number, 1> = {};

  constructor(private profitsService: ProfitsService, private authFacade: AuthFacade,
              public translate: TranslateService, private listPicker: ListPickerService,
              public settings: SettingsService) {
  }

  addItemToList(row: ProfitEntry): void {
    if (!this.list.some(r => r.id === +row.id)) {
      this.itemsInList[+row.id] = 1;
      this.list.push({
        id: +row.id,
        recipeId: null,
        amount: 1
      });
    }
  }

  removeItemFromList(id: number): void {
    delete this.itemsInList[id];
    this.list = this.list.filter(e => e.id !== id);
  }

  createList(): void {
    this.listPicker.addToList(...this.list);
  }

}
