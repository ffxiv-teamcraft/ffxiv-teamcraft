import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LayoutRowFilter } from '../../../core/layout/layout-row-filter';
import { LayoutRow } from '../../../core/layout/layout-row';
import { SettingsService } from '../../settings/settings.service';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import * as _ from 'lodash';

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

  tagInput$ = new BehaviorSubject<string>('');

  availableTags$ = combineLatest([this.tagInput$, this.authFacade.user$]).pipe(
    map(([input, user]) => {
      return _.uniq(user.itemTags
        .filter(entry => entry.tag.toLowerCase().indexOf(input.toLowerCase()) > -1)
        .map(entry => entry.tag));
    })
  );

  public filter: { isBooleanGate: boolean, reversed: boolean, value: string }[] = [];

  constructor(public settings: SettingsService, private authFacade: AuthFacade) {
  }

  filterChange(): void {
    this.row.filterName = this.filterToName();
    this.rowChange.emit(this.row);
  }

  public getAllFilters(): string[] {
    return LayoutRowFilter.ALL_NAMES;
  }

  public addFragment(): void {
    this.filter.push({ isBooleanGate: true, reversed: false, value: 'or' }, {
      isBooleanGate: false,
      reversed: false,
      value: 'NONE'
    });
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
    if (this.row.reverseTiers) {
      return 'reverseTiers';
    }
    if (this.row.npcBreakdown) {
      return 'npcBreakdown';
    }
    return 'default';
  }

  setLayoutType(type: 'tiers' | 'zoneBreakdown' | 'reverseTiers' | 'npcBreakdown'): void {
    this.row.tiers = type === 'tiers';
    this.row.zoneBreakdown = type === 'zoneBreakdown';
    this.row.reverseTiers = type === 'reverseTiers';
    this.row.npcBreakdown = type === 'npcBreakdown';
    this.rowChange.emit(this.row);
  }

  ngOnInit(): void {
    this.isOtherRow = this.row.isOtherRow();
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

  private filterToName(): string {
    return this.filter.map(fragment => `${fragment.reversed ? '!' : ''}${fragment.value}`).join(':');
  }

}
