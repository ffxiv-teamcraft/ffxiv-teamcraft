import { Component } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { DataService } from '../../../core/api/data.service';
import { NzModalRef } from 'ng-zorro-antd';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { HtmlToolsService } from '../../../core/tools/html-tools.service';
import { debounceTime, filter, startWith, switchMap, tap } from 'rxjs/operators';
import { SearchResult } from '../../../model/search/search-result';

@Component({
  selector: 'app-item-picker',
  templateUrl: './item-picker.component.html',
  styleUrls: ['./item-picker.component.less']
})
export class ItemPickerComponent {

  public query$: ReplaySubject<string> = new ReplaySubject<string>();

  public results$: Observable<SearchResult[]>;

  public onlyCraftable = true;

  loading = false;

  constructor(private dataService: DataService, private dialogRef: NzModalRef,
              private gt: GarlandToolsService, private htmlTools: HtmlToolsService) {
    this.results$ = this.query$.pipe(
      debounceTime(500),
      filter(query => query.length > 3),
      tap(() => this.loading = true),
      switchMap(query => {
        return this.dataService.searchItem(query, [], this.onlyCraftable);
      }),
      tap(() => this.loading = false),
      startWith([])
    );
  }

  /**
   * Gets job informations from a given job id.
   * @param {number} id
   * @returns {any}
   */
  getJob(id: number): any {
    return this.gt.getJob(id);
  }

  /**
   * Generates star html string for recipes with stars.
   * @param {number} nb
   * @returns {string}
   */
  getStars(nb: number): string {
    return this.htmlTools.generateStars(nb);
  }

  close(result: SearchResult): void {
    this.dialogRef.close(result);
  }
}
