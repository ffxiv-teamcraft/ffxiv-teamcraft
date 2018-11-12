import { Component, Input, OnInit } from '@angular/core';
import { NavigationObjective } from '../navigation-objective';
import { MapService } from '../map.service';
import { NavigationStep } from '../navigation-step';
import { Observable } from 'rxjs/Observable';

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

  optimizedPath: Observable<NavigationStep[]>;

  constructor(private mapService: MapService) {
  }

  ngOnInit() {
    this.optimizedPath = this.mapService.getOptimizedPath(this.mapId, this.points);
  }

}
