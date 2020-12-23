import { LayoutRowOrder } from './layout-row-order.enum';
import { LayoutRowFilter } from './layout-row-filter';
import { FilterResult } from './filter-result';
import { ListRow } from '../../modules/list/model/list-row';
import { List } from '../../modules/list/model/list';
import { SettingsService } from '../../modules/settings/settings.service';

export class LayoutRow {

  constructor(private _name: string,
              private _orderBy: string,
              private _order: LayoutRowOrder,
              private _filter: string,
              public index?: number,
              public zoneBreakdown = false,
              public npcBreakdown = false,
              public tiers = false,
              public reverseTiers = false,
              public hideIfEmpty = true,
              public hideCompletedRows = false,
              public hideUsedRows = false,
              public collapseIfDone = false,
              public collapsedByDefault = false,
              public hideZoneDuplicates = false,
              public hasTag = null,
              public tag?: string) {
  }

  public get filter(): LayoutRowFilter {
    return LayoutRowFilter.fromString(this._filter);
  }

  public set filter(filter: LayoutRowFilter) {
    this._filter = filter.name;
  }

  public get filterName(): string {
    return this._filter;
  }

  public set filterName(name: string) {
    this._filter = name;
  }

  public get name(): string {
    return this._name;
  }

  public set name(newValue: string) {
    this._name = newValue;
  }

  public get orderBy(): string {
    return this._orderBy;
  }

  public set orderBy(newOrderBy: string) {
    this._orderBy = newOrderBy;
  }

  public get order(): LayoutRowOrder {
    return this._order;
  }

  public set order(newOrder: LayoutRowOrder) {
    this._order = newOrder;
  }

  public doFilter(rows: ListRow[], userTags: { id: number, tag: string }[], list: List, settings: SettingsService): FilterResult {
    const filterResult = this.filter.filter(rows, list, settings);
    if (this.hasTag !== null) {
      const rejected: ListRow[] = [];
      filterResult.accepted.forEach(row => {
        let matches: boolean;
        const rowTags = userTags.filter(entry => entry.id === row.id).map(entry => entry.tag);
        if (this.hasTag) {
          matches = rowTags.some(tag => tag.toLowerCase() === this.tag.toLowerCase());
        } else {
          matches = !rowTags.some(tag => tag.toLowerCase() === this.tag.toLowerCase());
        }
        if (!matches) {
          rejected.push(row);
        }
      });
      filterResult.accepted = filterResult.accepted.filter(r => !rejected.some(reject => reject.id === r.id));
      filterResult.rejected.push(...rejected);
    }
    return filterResult;
  }

  public isOtherRow(): boolean {
    return this.filter.name === 'ANYTHING' && this.name === 'Other';
  }

  public clone(): LayoutRow {
    return new LayoutRow(
      this._name,
      this._orderBy,
      this._order,
      this._filter,
      this.index,
      this.zoneBreakdown,
      this.npcBreakdown,
      this.tiers,
      this.reverseTiers,
      this.hideIfEmpty,
      this.hideCompletedRows,
      this.hideUsedRows,
      this.collapseIfDone,
      this.collapsedByDefault,
      this.hideZoneDuplicates,
      this.hasTag,
      this.tag);
  }
}
