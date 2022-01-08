import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProfitsService } from '../profits.service';
import { LocalStorageBehaviorSubject } from '../../../core/rxjs/local-storage-behavior-subject';
import { AuthFacade } from '../../../+state/auth.facade';
import { map, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, merge, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ListRow } from '../../../modules/list/model/list-row';
import { ProfitEntry } from '../model/profit-entry';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';

@Component({
  selector: 'app-profits-helper',
  templateUrl: './profits-helper.component.html',
  styleUrls: ['./profits-helper.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfitsHelperComponent {

  loadingCrafting = false;

  loadingGathering = false;

  selfSufficient$ = new LocalStorageBehaviorSubject('profits:self-sufficient', true);

  levels$ = this.authFacade.mainCharacterEntry$.pipe(
    map(character => {
      return character.stats.map(row => row.level);
    })
  );

  serverFromCharacter$ = this.authFacade.mainCharacter$.pipe(
    map(character => {
      return character.Server;
    })
  );

  serverFromInput$ = new Subject<string>();

  server$ = merge(this.serverFromCharacter$, this.serverFromInput$);

  reloader$ = new BehaviorSubject<void>(void 0);

  crafts$ = combineLatest([
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
    })
  );

  gatherings$ = combineLatest([
    this.server$,
    this.levels$,
    this.reloader$
  ]).pipe(
    switchMap(([server, levels]) => {
      this.loadingGathering = true;
      return this.profitsService.getGatheringProfit(server, levels, 10);
    }),
    tap(() => {
      this.loadingGathering = false;
    })
  );

  list: Pick<ListRow, 'id' | 'recipeId' | 'amount'>[] = [];

  itemsInList: Record<number, 1> = {};

  constructor(private profitsService: ProfitsService, private authFacade: AuthFacade,
              public translate: TranslateService, private listPicker: ListPickerService) {
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
