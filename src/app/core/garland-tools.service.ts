import {Injectable} from '@angular/core';
import {GarlandToolsData} from '../model/garland-tools/garland-tools-data';
import {Drop} from '../model/garland-tools/drop';
import {Instance} from '../model/instance';

@Injectable()
export class GarlandToolsService {

    private gt: GarlandToolsData = (<any>window).gt;
    private gItemIndex: any[] = (<any>window).gItemIndex;

    public getJob(id: number): any {
        return this.gt.jobs.find(job => job.id === id);
    }

    public getCrystalDetails(id: number): any {
        return this.gt.item.index[id];
    }

    public getNode(id: number): any {
        const node = this.mockI18n(this.gt.node.index[id]);
        if (node.limitType !== undefined) {
            node.limitType = this.mockI18nLimitType(node);
        }
        return node;
    }

    public getLocation(id: number): any {
        return this.mockI18n(this.gt.location.index[id]);
    }

    public getFishingSpot(id: number): any {
        return this.mockI18n(this.gt.fishing.index[id]);
    }

    public getDrop(id: number): Drop {
        return this.mockI18n(this.gt.mob.index[id]);
    }

    public getInstance(id: any): Instance {
        const raw = this.gt.instance.partialIndex[id];
        const type = [undefined, 'Raid', 'Dungeon', 'Guildhest', 'Trial', 'PvP', 'PvP', undefined, undefined, 'Deep Dungeons',
            'Treasure Hunt', 'Seasonal Event'][raw.t];
        return this.mockI18n({
            name: raw.n,
            id: raw.id,
            type: {
                fr: type,
                en: type,
                de: type,
                ja: type
            }
        });
    }

    public getItem(id: number): any {
        for (const item of this.gItemIndex) {
            if (item.i === id) {
                return item;
            }
        }
    }

    private mockI18nLimitType(node: any): any {
        return {
            fr: node.limitType,
            en: node.limitType,
            de: node.limitType,
            ja: node.limitType,
        };
    }

    private mockI18n(item: any): any {
        if (item === undefined) {
            return item;
        }
        const clone = JSON.parse(JSON.stringify(item));
        clone.name = {
            fr: item.name,
            en: item.name,
            de: item.name,
            ja: item.name,
        };
        return clone;
    }
}
