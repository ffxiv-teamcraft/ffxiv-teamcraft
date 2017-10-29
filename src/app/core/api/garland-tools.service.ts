import {Injectable} from '@angular/core';
import {GarlandToolsData} from '../../model/list/garland-tools-data';
import {Item} from '../../model/garland-tools/item';
import {NgSerializerService} from '@kaiu/ng-serializer';

@Injectable()
export class GarlandToolsService {

    private gt: GarlandToolsData = (<any>window).gt;
    private gItemIndex: any[] = (<any>window).gItemIndex;

    constructor(private serializer: NgSerializerService) {
    }

    public getJob(id: number): any {
        return this.gt.jobs.find(job => job.id === id);
    }

    public getJobs(): any[] {
        return this.gt.jobs;
    }

    public getCrystalDetails(id: number): Item {
        return this.serializer.deserialize<Item>(this.gt.item.ingredients[id], Item);
    }

    public getFishingSpot(id: number): any {
        return this.gt.fishing.index[id];
    }

    getBellNode(id: number): any {
        return this.gt.bell.nodes.find(node => node.id === id);
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
