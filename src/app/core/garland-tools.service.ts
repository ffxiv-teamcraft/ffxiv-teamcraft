import {Injectable} from '@angular/core';
import {GarlandToolsData} from '../model/garland-tools/garland-tools-data';
import {Drop} from '../model/garland-tools/drop';

@Injectable()
export class GarlandToolsService {

    private gt: GarlandToolsData = (<any>window).gt;

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

    private mockI18nLimitType(node: any): any {
        const clone = JSON.parse(JSON.stringify(node));
        clone.limitType = {
            fr: node.limitType,
            en: node.limitType,
            de: node.limitType,
            ja: node.limitType,
        };
        return clone;
    }

    private mockI18n(item: any): any {
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
