import { Component } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { debounceTime, map, mergeMap } from 'rxjs/operators';
import { DataService } from '../../../core/api/data.service';
import * as nodePositions from '../../../core/data/sources/node-positions.json';

@Component({
  selector: 'app-gathering-location',
  templateUrl: './gathering-location.component.html',
  styleUrls: ['./gathering-location.component.less']
})
export class GatheringLocationComponent {

  query$: Subject<string> = new Subject<string>();


  results$: Observable<any[]>;

  constructor(private dataService: DataService) {
    this.results$ = this.query$.pipe(
      debounceTime(500),
      mergeMap(query => this.dataService.searchGathering(query)),
      map(items => {
        const nodes = items.map(item => {
          return Object.keys(nodePositions)
            .filter(key => {
              return nodePositions[key].items.indexOf(item.obj.i) > -1;
            })
            .map(key => {
              return { ...item, ...nodePositions[key], nodeId: key };
            });
        });
        const results = [].concat.apply([], nodes);

        //Once we have the resulting nodes, we need to remove the ones that appear twice or more for the same item.
        const finalNodes = [];
        results.forEach(row => {
          if (finalNodes.find(item => item.id === row.id && item.zoneid === row.zoneid) === undefined) {
            finalNodes.push(row);
          }
        });

        return finalNodes;
      })
    );
  }

}
