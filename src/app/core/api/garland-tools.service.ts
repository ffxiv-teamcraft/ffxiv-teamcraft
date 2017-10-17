import {Injectable} from '@angular/core';
import {GarlandToolsData} from '../../model/list/garland-tools-data';
import {Instance} from '../../model/list/instance';
import {Item} from '../../model/garland-tools/item';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {I18nToolsService} from '../i18n-tools.service';

@Injectable()
export class GarlandToolsService {

    private gt: GarlandToolsData = (<any>window).gt;
    private gItemIndex: any[] = (<any>window).gItemIndex;

    constructor(private serializer: NgSerializerService, private i18n: I18nToolsService) {
    }

    public getJob(id: number): any {
        return this.gt.jobs.find(job => job.id === id);
    }

    public getJobs(): any[] {
        return this.gt.jobs;
    }

    public getCrystalDetails(id: number): Item {
        return this.serializer.deserialize<Item>(this.gt.item.index[id], Item);
    }

    public getNode(id: number): any {
        const node = this.mockI18n(this.gt.node.index[id]);
        if (node.limitType !== undefined) {
            node.limitType = this.mockI18nLimitType(node);
        }
        return node;
    }

    public getFishingSpot(id: number): any {
        return this.gt.fishing.index[id];
    }

    public getInstance(id: any): Instance {
        const raw = this.gt.instance.partialIndex[id];
        if (raw === undefined) {
            return undefined;
        }
        const type = [undefined, 'Raid', 'Dungeon', 'Guildhest', 'Trial', 'PvP', 'PvP', undefined, undefined, 'Deep Dungeons',
            'Treasure Hunt', 'Seasonal Event'][raw.t];
        return {
            id: raw.i,
            name: {
                en: raw.en.n,
                de: raw.de.n,
                fr: raw.fr.n,
                ja: raw.ja.n,
            },
            type: {
                fr: type,
                en: type,
                de: type,
                ja: type
            }
        };
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

    getJobCategories(jobs: number[]): number[] {
        // Get all keys of the given object.
        return Object.keys(this.gt.jobCategories)
        // Get only the ones that are made for our job id.
            .filter(categoryId => {
                let match = true;
                jobs.forEach(job => {
                    match = match && this.gt.jobCategories[categoryId].jobs.indexOf(job) > -1;
                });
                return match;
            })
            // Then we convert the string array to a number array
            .map(key => +key);
    }
}
