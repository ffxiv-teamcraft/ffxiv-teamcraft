import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { GarlandToolsData } from '../../model/common/garland-tools-data';
import { Item } from '../../model/garland-tools/item';
import { JobCategory } from '../../model/garland-tools/job-category';
import { Venture } from '../../model/garland-tools/venture';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { HttpClient } from '@angular/common/http';
import { ItemData } from '../../model/garland-tools/item-data';
import { filter, map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { GtFish } from '../../model/common/gt-fish';
import { GtNode } from '../../model/common/gt-node';

@Injectable({
  providedIn: 'root'
})
export class GarlandToolsService {

  private gt: GarlandToolsData = (<any>window).gt || {};

  private gItemIndex: any[] = (<any>window).gItemIndex || [];

  private commonItemsToLoad = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

  private commonItemsCache: { id: string, obj: ItemData }[] = [];

  private loaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public onceLoaded$: Observable<boolean> = this.loaded$.pipe(filter(loaded => loaded));

  constructor(private serializer: NgSerializerService, private http: HttpClient,
              @Inject(PLATFORM_ID) platform: any) {
    this.preload();
  }

  public preload(): void {
    if (this.gt.jobCategories === undefined) {
      this.http.get<GarlandToolsData>('https://www.garlandtools.org/db/doc/core/en/3/data.json')
        .subscribe(data => {
          this.gt = Object.assign(this.gt, data);
          this.loaded$.next(true);
        });
    }
    if (this.commonItemsCache.length === 0) {
      this.http.get<any[]>(`https://www.garlandtools.org/db/doc/item/en/3/${this.commonItemsToLoad.join(',')}.json`)
        .pipe(
          map(items => {
            return items.map(item => {
              return {
                id: item.id,
                obj: this.serializer.deserialize<ItemData>(item.obj, ItemData)
              };
            });
          })
        )
        .subscribe(data => {
          this.commonItemsCache = data;
        });
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
   * Gets max exp for a given level, based on garlandtools informations.
   * @param level
   */
  getMaxXp(level: number): number {
    return this.gt.xp[level];
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
  public getCrystalDetails(id: number): ItemData | undefined {
    const found = this.commonItemsCache.find(item => item.id === id.toString());
    if (found === undefined) {
      return undefined;
    }
    return found.obj;
  }

  /**
   * Gets details about a fishing spot in garlandtools data.
   * @param {number} id
   * @returns {GtFish}
   */
  public getFishingSpots(id: number): GtFish[] {
    return this.gt.bell.fish.filter(fish => {
      return +fish.id === id;
    });
  }

  /**
   * Gets details about a fishing bait in garlandtools data.
   * @param {number} name
   * @returns {any}
   */
  public getBait(name: string): any {
    return this.gt.bell.bait[name];
  }

  /**
   * Gets details in a bell node (data used for garlandtools bell)
   * @param {number} id
   * @returns {GtNode}
   */
  getBellNode(id: number): GtNode {
    return this.gt.bell.nodes.find(node => node.id === id);
  }

  getBellNodesForItemId(itemId: number): GtNode[] {
    return this.gt.bell.nodes.filter(node => node.items.some(i => i.id === itemId));
  }

  /**
   * Gets details for a given job category in garlandtools data.
   * @param {number} id
   * @returns {JobCategory}
   */
  getJobCategory(id: number): JobCategory {
    return this.gt.jobCategories[id];
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

  /**
   * Gets a list of ventures based on their ids in garlandtools data.
   * @param {number[]} ids
   * @returns {Venture[]}
   */
  getVentures(ids: number[]): Venture[] {
    return ids.map(id => {
      const venture = this.gt.ventureIndex[id];
      const category = this.getJobCategory(venture.jobs);

      // Convert the jobCategory (jobs) to a job id
      if (category.jobs.length > 1) {
        // Custom id to represent the DoW/M "hybrid" job
        venture.job = 100;
      } else {
        venture.job = category.jobs[0];
      }

      return venture;
    });
  }
}
