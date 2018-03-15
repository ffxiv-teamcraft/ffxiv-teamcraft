import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DataService} from '../../../core/api/data.service';
import {ItemData} from '../../../model/garland-tools/item-data';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';

@Component({
    selector: 'app-gathering-location',
    templateUrl: './gathering-location.component.html',
    styleUrls: ['./gathering-location.component.scss']
})
export class GatheringLocationComponent implements OnInit {


    @ViewChild('filter')
    filterElement: ElementRef;

    result: Observable<ItemData[]>;

    constructor(private dataService: DataService) {
    }

    ngOnInit() {
        this.result = Observable.fromEvent(this.filterElement.nativeElement, 'keyup')
            .map(() => this.filterElement.nativeElement.value)
            .debounceTime(500)
            .distinctUntilChanged()
            .mergeMap(name => this.dataService.searchGathering(name));
    }

}
