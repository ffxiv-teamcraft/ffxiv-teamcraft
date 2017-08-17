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
}
