import {Injectable} from '@angular/core';
import {GarlandToolsData} from '../model/garland-tools/garland-tools-data';

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
        return this.gt.node.index[id];
    }

    public getLocation(id: number): any {
        return this.gt.location.index[id];
    }

    getFishingSpot(id: number): any {
        return this.gt.fishing.index[id];
    }
}
