import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {ListRow} from '../../../model/list/list-row';
import {List} from '../../../model/list/list';
import {SettingsService} from '../../settings/settings.service';
import {trackByItem} from '../../../core/tools/track-by-item';

@Component({
    selector: 'app-list-details-panel',
    templateUrl: './list-details-panel.component.html',
    styleUrls: ['./list-details-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListDetailsPanelComponent implements OnChanges, OnInit {

    @Input()
    title: string;

    @Input()
    data: ListRow[];

    @Input()
    list: List;

    @Input()
    recipe = false;

    @Input()
    preCraft = false;

    @Input()
    showTier = false;

    @Output()
    done: EventEmitter<number> = new EventEmitter<number>();

    @Output()
    update: EventEmitter<void> = new EventEmitter<void>();

    @Input()
    expanded = true;

    @Output()
    opened: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    closed: EventEmitter<void> = new EventEmitter<void>();

    tiers: ListRow[][] = [[]];

    tierBreakdownToggle = false;

    constructor(public settings: SettingsService) {
    }

    public trackByItem(index: number, item: ListRow): any {
        return trackByItem(index, item);
    }

    /**
     * Returns a list of tiers based on dependencies between each list row.
     * each tier is a list of rows.
     */
    public generateTiers(): void {
        if (this.data !== null) {
            this.tiers = [[]];
            this.data.sort((a: ListRow, b: ListRow) => {
                if (a.requires !== undefined && a.requires.find(requirement => requirement.id === b.id) !== undefined) {
                    return 1;
                }
                return -1;
            }).forEach(row => {
                if (row.requires !== undefined) {
                    this.tiers = this.setTier(row, this.tiers);
                }
            });
        }
    }

    private setTier(row: ListRow, result: ListRow[][]): ListRow[][] {
        if (result[0] === undefined) {
            result[0] = [];
        }
        // Default tier is -1, because we want to do +1 to the last requirement tier to define the tier of the current item.
        let requirementsTier = -1;
        for (const requirement of row.requires) {
            for (let tier = 0; tier < result.length; tier++) {
                if (result[tier].find(r => r.id === requirement.id) !== undefined) {
                    requirementsTier = requirementsTier > tier ? requirementsTier : tier;
                }
            }
        }
        const itemTier = requirementsTier + 1;
        if (result[itemTier] === undefined) {
            result[itemTier] = [];
        }
        result[itemTier].push(row);
        return result;
    }

    public toggleTierBreakdown(): void {
        this.tierBreakdownToggle = !this.tierBreakdownToggle;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.list !== undefined && changes.list.previousValue !== changes.list.currentValue) {
            this.generateTiers();
        }
    }

    ngOnInit(): void {
        this.generateTiers();
    }
}
