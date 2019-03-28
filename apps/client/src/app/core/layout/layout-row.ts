import { LayoutRowOrder } from './layout-row-order.enum';
import { LayoutRowFilter } from './layout-row-filter';

export class LayoutRow {

  constructor(private _name: string,
              private _orderBy: string,
              private _order: LayoutRowOrder,
              private _filter: string,
              public index?: number,
              public zoneBreakdown = false,
              public tiers = false,
              public hideIfEmpty = true,
              public hideCompletedRows = false,
              public hideUsedRows = false,
              public collapseIfDone = false,
              public hideZoneDuplicates = false,
              public hasTag?: boolean,
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
}
