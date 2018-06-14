import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {ListRow} from '../../../model/list/list-row';
import {List} from '../../../model/list/list';
import {SettingsService} from '../../settings/settings.service';
import {LocalizedDataService} from '../../../core/data/localized-data.service';
import {I18nName} from '../../../model/list/i18n-name';
import {ZoneBreakdown} from '../../../model/list/zone-breakdown';
import {ZoneBreakdownRow} from '../../../model/list/zone-breakdown-row';
import {AppUser} from '../../../model/list/app-user';
import {MatDialog} from '@angular/material';
import {NavigationMapPopupComponent} from '../navigation-map-popup/navigation-map-popup.component';
import {NavigationObjective} from '../../../modules/map/navigation-objective';
import {Vector2} from '../../../core/tools/vector2';
import {Permissions} from '../../../core/database/permissions/permissions';
import {I18nToolsService} from '../../../core/tools/i18n-tools.service';
import {TotalPricePopupComponent} from '../total-price-popup/total-price-popup.component';

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

    @Input()
    zoneBreakdown = false;

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

    @Input()
    user: AppUser;

    tiers: ListRow[][] = [[]];

    zoneBreakdownData: ZoneBreakdown;

    permissions: Permissions;

    hasVendors = false;

    constructor(public settings: SettingsService, private dataService: LocalizedDataService, private dialog: MatDialog,
                private l12n: LocalizedDataService, private i18nTools: I18nToolsService) {
    }

    showTotalPrice(): void {
        this.dialog.open(TotalPricePopupComponent, {data: this.data});
    }

    /**
     * Returns a list of tiers based on dependencies between each list row.
     * each tier is a list of rows.
     */
    public generateTiers(): void {
        if (this.data !== null) {
            this.tiers = [[]];
            this.topologicalSort(this.data).forEach(row => {
                this.tiers = this.setTier(row, this.tiers);
            });
        }
    }

    public getLocation(id: number): I18nName {
        if (id === -1) {
            return {fr: 'Autre', de: 'Anderes', ja: 'Other', en: 'Other'};
        }
        return this.dataService.getPlace(id);
    }

    private topologicalSort(data: ListRow[]): ListRow[] {
        const res: ListRow[] = [];
        const doneList: boolean[] = [];
        while (data.length > res.length) {
            let resolved = false;

            for (const item of data) {
                if (res.indexOf(item) > -1) {
                    // item already in resultset
                    continue;
                }
                resolved = true;

                if (item.requires !== undefined) {
                    for (const dep of item.requires) {
                        // We have to check if it's not a precraft, as some dependencies aren't resolvable inside the current array.
                        const depIsInArray = data.find(row => row.id === dep.id) !== undefined;
                        if (!doneList[dep.id] && depIsInArray) {
                            // there is a dependency that is not met:
                            resolved = false;
                            break;
                        }
                    }
                }
                if (resolved) {
                    // All dependencies are met:
                    doneList[item.id] = true;
                    res.push(item);
                }
            }
        }
        return res;
    }

    private setTier(row: ListRow, result: ListRow[][]): ListRow[][] {
        if (result[0] === undefined) {
            result[0] = [];
        }
        // Default tier is -1, because we want to do +1 to the last requirement tier to define the tier of the current item.
        let requirementsTier = -1;
        for (const requirement of (row.requires || [])) {
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

    public openNavigationMap(zoneBreakdownRow: ZoneBreakdownRow): void {
        const data: { mapId: number, points: NavigationObjective[] } = {
            mapId: zoneBreakdownRow.zoneId,
            points: <NavigationObjective[]>zoneBreakdownRow.items
                .filter(item => item.done <= item.amount)
                .map(item => {
                    const coords = this.getCoords(item, zoneBreakdownRow);
                    if (coords !== undefined) {
                        return <NavigationObjective>{
                            x: coords.x,
                            y: coords.y,
                            name: this.l12n.getItem(item.id),
                            iconid: item.icon,
                            item_amount: item.amount_needed - item.done,
                            type: 'Gathering'
                        }
                    }
                    return undefined;
                })
                .filter(row => row !== undefined)
        };
        this.dialog.open(NavigationMapPopupComponent, {data: data});
    }

    public getCoords(item: ListRow, zoneBreakdownRow: ZoneBreakdownRow): Vector2 {
        if (item.gatheredBy !== undefined) {
            const node = item.gatheredBy.nodes.find(n => n.zoneid === zoneBreakdownRow.zoneId);
            if (node !== undefined && node.coords !== undefined) {
                return {x: node.coords[0], y: node.coords[1]};
            }
        }
        return undefined;
    }

    public hasNavigationMap(zoneBreakdownRow: ZoneBreakdownRow): boolean {
        return zoneBreakdownRow.items
            .filter(item => item.done <= item.amount)
            .map(item => {
                const coords = this.getCoords(item, zoneBreakdownRow);
                if (coords === undefined) {
                    return undefined;
                }
                return {x: coords.x, y: coords.y, name: this.l12n.getItem(item.id), iconid: item.icon}
            })
            .filter(row => row !== undefined).length >= 2;
    }

    public getTextExport(): string {
        return this.data.reduce((exportString, row) => {
            return exportString + `${row.amount}x ${this.i18nTools.getName(this.dataService.getItem(row.id))}\n`
        }, `${this.title} :\n`);
    }

    trackByFn(index: number, item: ListRow) {
        return item.id;
    }

    trackByZoneFn(index: number, item: ZoneBreakdownRow) {
        return item.zoneId;
    }

    trackByTierFn(index: number, item: ListRow[]) {
        return item.length;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.user !== undefined) {
            this.permissions = this.list.getPermissions(this.user.$key);
        }
        if (this.showTier) {
            this.generateTiers();
        }
        if (this.zoneBreakdown) {
            this.zoneBreakdownData = new ZoneBreakdown(this.data);
        }
        if (this.data) {
            this.hasVendors = this.data.find(row => {
                return (row.tradeSources !== undefined && row.tradeSources !== null && row.tradeSources.length > 0)
                    || (row.vendors !== undefined && row.vendors !== null && row.vendors.length > 0);
            }) !== undefined;
        }
    }

    ngOnInit(): void {
        if (this.user !== undefined) {
            this.permissions = this.list.getPermissions(this.user.$key);
        }
        if (this.showTier) {
            this.generateTiers();
        }
        if (this.zoneBreakdown) {
            this.zoneBreakdownData = new ZoneBreakdown(this.data);
        }
    }
}
