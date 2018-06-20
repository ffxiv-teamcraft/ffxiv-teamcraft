import {Injectable} from '@angular/core';
import {GarlandToolsData} from '../../model/list/garland-tools-data';
import {Item} from '../../model/garland-tools/item';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class GarlandToolsService {

    private gt: GarlandToolsData = (<any>window).gt;
    private gItemIndex: any[] = (<any>window).gItemIndex;

    constructor(private serializer: NgSerializerService, private http: HttpClient) {
    }

    public preload(): void {
        if (this.gt.jobCategories === undefined) {
            this.http.get<GarlandToolsData>('https://www.garlandtools.org/db/doc/core/en/2/data.json')
                .subscribe(data => this.gt = Object.assign(this.gt, data));
        }
    }

    /**
     * Gets a job item.
     * @param {number} id
     * @returns {any}
     */
    public getJob(id: number): any {
        return this.gt.jobs.find(job => job.id === id);
    }

    /**
     * Gets all the jobs stored by garlandtools.
     * @returns {any[]}
     */
    public getJobs(): any[] {
        return this.gt.jobs;
    }

    /**
     * Gets details for a given crystal in garlandtools data.
     * @param {number} id
     * @returns {Item}
     */
    public getCrystalDetails(id: number): Item {
        return this.serializer.deserialize<Item>(this.gt.item.ingredients[id], Item);
    }

    /**
     * Gets details about a fishing spot in garlandtools data.
     * @param {number} id
     * @returns {any}
     */
    public getFishingSpot(id: number): any {
        return this.gt.fishing.index[id];
    }

    /**
     * Gets details in a bell node (data used for garlandtools bell)
     * @param {number} id
     * @returns {any}
     */
    getBellNode(id: number): any {
        return this.gt.bell.nodes.find(node => node.id === id);
    }

    /**
     * Gets a list of category ids for a given job, useful for search filters.
     * @param {number[]} jobs
     * @returns {number[]}
     */
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
