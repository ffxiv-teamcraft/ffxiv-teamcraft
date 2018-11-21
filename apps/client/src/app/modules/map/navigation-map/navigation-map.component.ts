import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NavigationObjective } from '../navigation-objective';
import { MapService } from '../map.service';
import { NavigationStep } from '../navigation-step';
import { Observable } from 'rxjs/Observable';
import { Vector2 } from '../../../core/tools/vector2';
import { MapData } from '../map-data';
import { first } from 'rxjs/operators';

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

  constructor(private mapService: MapService) {
  }

  ngOnInit() {
    this.optimizedPath$ = this.mapService.getOptimizedPath(this.mapId, this.points);
    setTimeout(() => {
      this.mapService.getMapById(this.mapId).pipe(first()).subscribe(map => this.map = map);
    }, 50);
  }

  getPositionPercent(coords: Vector2): Vector2 {
    const positionPercents = this.mapService.getPositionOnMap(this.map, coords);
    return {
      x: positionPercents.x * this.containerRef.nativeElement.offsetWidth / 100,
      y: positionPercents.y * this.containerRef.nativeElement.offsetHeight / 100
    };
  }

}
