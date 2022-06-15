import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NavigationObjective } from '../navigation-objective';
import { MapService } from '../map.service';
import { NavigationStep } from '../navigation-step';
import { BehaviorSubject, combineLatest, fromEvent, Observable, Subject } from 'rxjs';
import { Vector2 } from '../../../core/tools/vector2';
import { MapData } from '../map-data';
import { filter, first, map, shareReplay, takeUntil } from 'rxjs/operators';
import { WorldNavigationStep } from '../world-navigation-step';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';

@Component({
  selector: 'app-world-navigation-map',
  templateUrl: './world-navigation-map.component.html',
  styleUrls: ['./world-navigation-map.component.less']
})
export class WorldNavigationMapComponent extends TeamcraftComponent implements OnInit {

  @Input()
  public points: NavigationObjective[] = [];

  public optimizedPath$: Observable<WorldNavigationStep[]>;

  public containerRef: ElementRef;

  public currentPathIndex$ = new BehaviorSubject(0);

  public currentPath$: Observable<WorldNavigationStep>;

  public markedAsDone = [];

  public markAsDone$: Subject<NavigationStep> = new Subject<NavigationStep>();

  constructor(private mapService: MapService) {
    super();
    fromEvent(window, 'keydown').pipe(
      filter((event: KeyboardEvent) => event.key === 'ArrowRight' || event.key === 'ArrowLeft'),
      takeUntil(this.onDestroy$)
    ).subscribe(event => {
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      this.currentPathIndex$.next(this.currentPathIndex$.value - direction);
    });
  }

  @ViewChild('container', { static: false })
  public set _containerRef(ref: ElementRef) {
    setTimeout(() => {
      this.containerRef = ref;
    }, 500);
  }

  ngOnInit() {
    this.optimizedPath$ = this.mapService.getOptimizedPathInWorld(this.points).pipe(
      first(),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.currentPath$ = combineLatest([this.optimizedPath$, this.currentPathIndex$]).pipe(
      map(([path, index]) => {
        return path[index];
      })
    );
  }

  getPositionPercent(mapData: MapData, coords: Vector2): Vector2 {
    const positionPercents = this.mapService.getPositionOnMap(mapData, coords);
    return {
      x: positionPercents.x * this.containerRef.nativeElement.offsetWidth / 100,
      y: positionPercents.y * this.containerRef.nativeElement.offsetHeight / 100
    };
  }

  markStepAsDone(step: NavigationStep): void {
    this.markedAsDone.push(step);
    this.markAsDone$.next(step);
  }

}
