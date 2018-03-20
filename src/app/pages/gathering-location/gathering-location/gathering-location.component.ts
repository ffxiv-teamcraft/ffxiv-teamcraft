import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DataService} from '../../../core/api/data.service';
import {Observable} from 'rxjs/Observable';
import * as nodePositions from '../../../core/data/sources/node-positions.json';
import 'rxjs/add/observable/fromEvent';
import {ObservableMedia} from '@angular/flex-layout';
import {BellNodesService} from '../../../core/data/bell-nodes.service';
import {AlarmCardComponent} from '../../alarms/alarm-card/alarm-card.component';

@Component({
    selector: 'app-gathering-location',
    templateUrl: './gathering-location.component.html',
    styleUrls: ['./gathering-location.component.scss']
})
export class GatheringLocationComponent implements OnInit {


    @ViewChild('filter')
    filterElement: ElementRef;

    result: Observable<any[]>;

    searching = false;

    constructor(private dataService: DataService, private media: ObservableMedia, private bell: BellNodesService) {
    }

    ngOnInit() {
        this.result = Observable.fromEvent(this.filterElement.nativeElement, 'keyup')
            .map(() => this.filterElement.nativeElement.value)
            .debounceTime(500)
            .distinctUntilChanged()
            .do(() => this.searching = true)
            .mergeMap(name => this.dataService.searchGathering(name))
            .map(items => {
                return items
                // First of all, add node informations
                    .map(item => {
                        item.nodes = Object.keys(nodePositions)
                            .map(key => {
                                const node = nodePositions[key];
                                node.id = key;
                                return node;
                            })
                            .filter(row => {
                                return row.items.indexOf(item.obj.i) > -1;
                            });
                        if (item.nodes.length === 0) {
                            return undefined;
                        }
                        return item;
                    })
                    // Remove items with no nodes
                    .filter(item => item !== undefined)
                    // Add timers if the node has some
                    .map(item => {
                        item.nodes = item.nodes.map(node => {
                            const bellNode = this.bell.getNode(+node.id);
                            node.timed = bellNode !== undefined;
                            if (node.timed) {
                                node.time = bellNode.time;
                                node.uptime = bellNode.uptime;
                            }
                            return node;
                        });
                        return item;
                    });
            })
            .do(() => this.searching = false);
    }

    getClassIcon(type: number): string {
        return AlarmCardComponent.icons[type];
    }

    getSpawns(node: any): string[] {
        return node.time.map(time => `${time} - ${(time + node.uptime / 60) % 24}`);
    }

    getCols(): number {
        if (this.media.isActive('xs') || this.media.isActive('sm')) {
            return 1;
        }
        if (this.media.isActive('md')) {
            return 2;
        }
        return 3;
    }

}
