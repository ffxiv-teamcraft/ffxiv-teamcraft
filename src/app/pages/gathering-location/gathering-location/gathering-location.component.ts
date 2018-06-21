import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DataService} from '../../../core/api/data.service';
import {fromEvent, Observable} from 'rxjs';
import * as nodePositions from '../../../core/data/sources/node-positions.json';

import {ObservableMedia} from '@angular/flex-layout';
import {BellNodesService} from '../../../core/data/bell-nodes.service';
import {AlarmCardComponent} from '../../alarms/alarm-card/alarm-card.component';
import {AlarmService} from '../../../core/time/alarm.service';
import {Alarm} from '../../../core/time/alarm';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {debounceTime, distinctUntilChanged, map, mergeMap, tap} from 'rxjs/operators';

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

    constructor(private dataService: DataService, private media: ObservableMedia, private bell: BellNodesService,
                private alarmService: AlarmService, private snack: MatSnackBar, private translator: TranslateService) {
    }

    ngOnInit() {
        this.result = fromEvent(this.filterElement.nativeElement, 'keyup')
            .pipe(
                map(() => this.filterElement.nativeElement.value),
                debounceTime(500),
                distinctUntilChanged(),
                tap(() => this.searching = true),
                mergeMap(name => this.dataService.searchGathering(name)),
                map(items => {
                    return items
                    //  Only use gatherable results
                        .filter(item => item.obj.f === undefined)
                        // First of all, add node informations
                        .map(item => {
                            item.nodes = Object.keys(nodePositions)
                                .map(key => {
                                    const node = nodePositions[key];
                                    node.id = +key;
                                    node.itemId = item.obj.i;
                                    return node;
                                })
                                .filter(row => row.items !== undefined)
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
                }),
                tap(() => this.searching = false)
            );
    }

    createAlarm(nodeInput: any): void {
        const node = this.bell.getNode(nodeInput.id);
        const match = node.items.find(item => item.id === +nodeInput.itemId);
        node.icon = match.icon;
        node.slot = +match.slot;
        const alarms: Alarm[] = [];
        if (node.time !== undefined) {
            node.time.forEach(spawn => {
                alarms.push({
                    spawn: spawn,
                    duration: node.uptime / 60,
                    itemId: nodeInput.itemId,
                    icon: node.icon,
                    slot: node.slot,
                    areaId: node.areaid,
                    coords: node.coords,
                    zoneId: node.zoneid,
                    type: this.alarmService.getType(node),
                });
            });
        }
        this.alarmService.registerAlarms(...alarms);
        this.snack.open(this.translator.instant('ALARMS.Alarm_created'), '', {duration: 3000});
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
