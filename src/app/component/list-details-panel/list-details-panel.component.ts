import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {ListRow} from '../../model/list/list-row';
import {List} from '../../model/list/list';

@Component({
    selector: 'app-list-details-panel',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './list-details-panel.component.html',
    styleUrls: ['./list-details-panel.component.scss']
})
export class ListDetailsPanelComponent {

    @Input()
    title: string;

    @Input()
    data: ListRow[];

    @Input()
    list: List;

    @Input()
    recipe = false;

    @Input()
    showTier = false;

    @Output()
    done: EventEmitter<number> = new EventEmitter<number>();

    @Output()
    update: EventEmitter<void> = new EventEmitter<void>();

    tierBreakdownToggle = false;

    /**
     * Returns a list of tiers based on dependencies between each list row.
     * each tier is a list of rows.
     * @returns {ListRow[][]}
     */
    public getTiers(): ListRow[][] {
        let result = [[]];
        this.data.forEach(row => {
            result = this.setTier(row, result);
        });
        return result;
    }

    private setTier(row: ListRow, result: ListRow[][], tier = 0): ListRow[][] {
        if (result[tier] === undefined) {
            result[tier] = [];
        }
        for (const requirement of row.requires) {
            if (result[tier].find(r => r.id === requirement.id) !== undefined) {
                return this.setTier(row, result, tier + 1);
            }
        }
        result[tier].push(row);
        return result;
    }

    public toggleTierBreakdown(): void {
        this.tierBreakdownToggle = !this.tierBreakdownToggle;
    }

}
