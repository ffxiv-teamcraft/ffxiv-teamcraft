import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NavigationObjective } from '../navigation-objective';
import { MapService } from '../map.service';
import { NavigationStep } from '../navigation-step';
import { BehaviorSubject, combineLatest, fromEvent, Observable, Subject } from 'rxjs';
import { Vector2 } from '@ffxiv-teamcraft/types';
import { MapData } from '../map-data';
import { filter, first, map, shareReplay, takeUntil } from 'rxjs/operators';
import { WorldNavigationStep } from '../world-navigation-step';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { LazyIconPipe } from '../../../pipes/pipes/lazy-icon.pipe';
import { NodeTypeIconPipe } from '../../../pipes/pipes/node-type-icon.pipe';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { ClipboardDirective } from '../../../core/clipboard.directive';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzListModule } from 'ng-zorro-antd/list';
import { MapComponent } from '../map/map.component';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, NgFor, AsyncPipe, DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-world-navigation-map',
    templateUrl: './world-navigation-map.component.html',
    styleUrls: ['./world-navigation-map.component.less'],
    standalone: true,
    imports: [NgIf, FlexModule, NzButtonModule, NzWaveModule, NzIconModule, NzSelectModule, FormsModule, NgFor, MapComponent, NzListModule, NzToolTipModule, ClipboardDirective, NzSpinModule, AsyncPipe, DecimalPipe, NodeTypeIconPipe, LazyIconPipe, I18nPipe, TranslateModule, I18nRowPipe]
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
      const direction = event.key === 'ArrowRight' ? -1 : 1;
      this.currentPathIndex$.next(Math.max(this.currentPathIndex$.value - direction, 0));
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
    const positionPercents = this.mapService.getPositionPercentOnMap(mapData, coords);
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
