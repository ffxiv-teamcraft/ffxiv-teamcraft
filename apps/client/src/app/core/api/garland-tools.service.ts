import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { GarlandToolsData } from '../../model/common/garland-tools-data';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { HttpClient } from '@angular/common/http';
import { filter } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GarlandToolsService {

  private gt: GarlandToolsData = (<any>window).gt || {};

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
}
