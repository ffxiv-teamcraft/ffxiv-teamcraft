import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LayoutRowFilter } from '../../../core/layout/layout-row-filter';
import { LayoutRow } from '../../../core/layout/layout-row';

@Component({
  selector: 'app-layout-editor-row',
  templateUrl: './layout-editor-row.component.html',
  styleUrls: ['./layout-editor-row.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutEditorRowComponent implements OnInit {

  @Input()
  row: LayoutRow;

  @Output()
  rowChange: EventEmitter<LayoutRow> = new EventEmitter<LayoutRow>();

  @Input()
  readonly = false;

  @Output()
  delete: EventEmitter<void> = new EventEmitter<void>();

  isOtherRow = false;

  public filter: { isBooleanGate: boolean, reversed: boolean, value: string }[] = [];

  filterChange(): void {
    this.row.filterName = this.filterToName();
    this.rowChange.emit(this.row);
  }

  private filterToName(): string {
    return this.filter.map(fragment => `${fragment.reversed ? '!' : ''}${fragment.value}`).join(':');
  }

  public getAllFilters(): string[] {
    return LayoutRowFilter.ALL_NAMES;
  }

  public addFragment(): void {
    this.filter.push({ isBooleanGate: true, reversed: false, value: 'or' }, { isBooleanGate: false, reversed: false, value: 'NONE' });
    this.rowChange.emit(this.row);
  }

  public removeFragment(): void {
    if (this.filter.length > 1) {
      this.filter.splice(-2, 2);
    }
    this.filterChange();
  }

  getLayoutType(): string {
    if (this.row.tiers) {
      return 'tiers';
    }
    if (this.row.zoneBreakdown) {
      return 'zoneBreakdown';
    }
    return 'default';
  }

  setLayoutType(type: 'tiers' | 'zoneBreakdown'): void {
    this.row.tiers = type === 'tiers';
    this.row.zoneBreakdown = type === 'zoneBreakdown';
    this.rowChange.emit(this.row);
  }


  ngOnInit(): void {
    this.isOtherRow = this.row.filter.name === "ANYTHING";
    this.filter = this.row.filterName.split(':').map(fragment => {
      const result = {
        isBooleanGate: fragment === 'or' || fragment === 'and',
        value: fragment,
        reversed: fragment.charAt(0) === '!'
      };
      if (result.reversed) {
        result.value = result.value.substr(1);
      }
      return result;
    });
  }

}
