import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DataType, Region, SearchResult, SearchType } from '@ffxiv-teamcraft/types';
import { observeInput } from '../../../core/rxjs/observe-input';
import { map } from 'rxjs/operators';
import { IfRegionsPipe } from '../../../pipes/pipes/if-regions';
import { MapNamePipe } from '../../../pipes/pipes/map-name.pipe';
import { XivapiL12nPipe } from '../../../pipes/pipes/xivapi-l12n.pipe';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { NodeTypeIconPipe } from '../../../pipes/pipes/node-type-icon.pipe';
import { ActionNamePipe } from '../../../pipes/pipes/action-name.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { MouseWheelDirective } from '../../../core/event/mouse-wheel/mouse-wheel.directive';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { ItemSourcesDisplayComponent } from '../../../modules/list/item/item-sources-display/item-sources-display.component';
import { CompanyWorkshopTreeButtonComponent } from '../../../modules/company-workshop-tree/company-workshop-tree-button/company-workshop-tree-button.component';
import { MarketboardIconComponent } from '../../../modules/marketboard/marketboard-icon/marketboard-icon.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { RouterLink } from '@angular/router';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { TutorialStepDirective } from '../../../core/tutorial/tutorial-step.directive';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { ItemRarityDirective } from '../../../core/item-rarity/item-rarity.directive';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { FormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, NgSwitch, NgSwitchCase, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-search-result',
    templateUrl: './search-result.component.html',
    styleUrls: ['./search-result.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, FlexModule, NzCheckboxModule, FormsModule, ItemIconComponent, ItemRarityDirective, DbButtonComponent, TutorialStepDirective, NzButtonModule, NzToolTipModule, RouterLink, NzIconModule, MarketboardIconComponent, CompanyWorkshopTreeButtonComponent, ItemSourcesDisplayComponent, NzGridModule, NzInputModule, NzInputNumberModule, MouseWheelDirective, NzWaveModule, NgSwitch, NgSwitchCase, AsyncPipe, I18nPipe, TranslateModule, I18nRowPipe, ActionNamePipe, NodeTypeIconPipe, XivapiIconPipe, XivapiL12nPipe, MapNamePipe, IfRegionsPipe]
})
export class SearchResultComponent {

  //Bound for number of a single item to be added to list
  minAmount = 1;

  @Input()
  row: SearchResult;

  rowWithSources$ = observeInput(this, 'row').pipe(
    map(row => {
      if (row.recipe) {
        row.sources = row.sources.map(source => {
          if (source.type === DataType.CRAFTED_BY) {
            return {
              ...source,
              data: source.data.filter(r => r.id.toString() === row.recipe.recipeId.toString())
            };
          }
          return source;
        });
      }
      return row;
    })
  );

  @Input()
  odd: boolean;

  @Input()
  currentLang: string;

  @Output()
  addItemsToList = new EventEmitter();

  @Output()
  createQuickList = new EventEmitter();

  @Output()
  openInSimulator = new EventEmitter();

  @Output()
  selectedChange = new EventEmitter<SearchResult>();

  @Output()
  amountChanged = new EventEmitter<SearchResult>();

  @Input()
  selected: boolean;

  searchTypes = SearchType;

  public Region = Region;

  selectionChange(row: SearchResult, selected: boolean): void {
    this.selectedChange.emit({ ...row, selected });
  }

  //Increment/Decrement nz-input-number value through mouse wheel
  public adjust(amount: number): void {
    this.row.amount += amount;

    if (this.row.amount <= this.minAmount) {
      this.row.amount = this.minAmount;
    }

    this.amountChanged.next(this.row);
  }

}
