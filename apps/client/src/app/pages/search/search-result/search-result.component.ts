import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Region, SearchResult, SearchType } from '@ffxiv-teamcraft/types';

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
