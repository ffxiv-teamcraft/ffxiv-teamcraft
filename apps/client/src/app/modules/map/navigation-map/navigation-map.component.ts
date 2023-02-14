import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NavigationObjective } from '../navigation-objective';
import { MapService } from '../map.service';
import { NavigationStep } from '../navigation-step';
import { Observable } from 'rxjs';
import { Vector2 } from '@ffxiv-teamcraft/types';
import { MapData } from '../map-data';
import { first } from 'rxjs/operators';
import { ListsFacade } from '../../list/+state/lists.facade';

@Component({
  selector: 'app-navigation-map',
  templateUrl: './navigation-map.component.html',
  styleUrls: ['./navigation-map.component.less']
})
export class NavigationMapComponent implements OnInit {

  @Input()
  mapId: number;

  @Input()
  points: NavigationObjective[] = [];

  optimizedPath$: Observable<NavigationStep[]>;

  map: MapData;

  @ViewChild('container')
  public containerRef: ElementRef;

  markedAsDone = [];

  constructor(private mapService: MapService, private listsFacade: ListsFacade) {
  }

  ngOnInit() {
    this.optimizedPath$ = this.mapService.getOptimizedPathOnMap(this.mapId, this.points);
    setTimeout(() => {
      this.mapService.getMapById(this.mapId).pipe(first()).subscribe(map => this.map = map);
    }, 50);
  }

  getPositionPercent(coords: Vector2): Vector2 {
    const positionPercents = this.mapService.getPositionPercentOnMap(this.map, coords);
    return {
      x: positionPercents.x * this.containerRef.nativeElement.offsetWidth / 100,
      y: positionPercents.y * this.containerRef.nativeElement.offsetHeight / 100
    };
  }

  markStepAsDone(step: NavigationStep): void {
    this.markedAsDone.push(step.itemId);
    this.listsFacade.setItemDone(step.itemId, step.iconid, step.finalItem, step.item_amount, null, step.total_item_amount);
  }

}
