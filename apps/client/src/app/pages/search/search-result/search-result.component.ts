import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DataType, Region, SearchResult, SearchType } from '@ffxiv-teamcraft/types';
import { observeInput } from '../../../core/rxjs/observe-input';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
