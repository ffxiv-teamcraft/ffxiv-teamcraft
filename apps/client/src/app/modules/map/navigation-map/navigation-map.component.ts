import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NavigationObjective } from '../navigation-objective';
import { MapService } from '../map.service';
import { NavigationStep } from '../navigation-step';
import { Observable } from 'rxjs';
import { Vector2 } from '@ffxiv-teamcraft/types';
import { MapData } from '../map-data';
import { first } from 'rxjs/operators';
import { ListsFacade } from '../../list/+state/lists.facade';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { LazyRowPipe } from '../../../pipes/pipes/lazy-row.pipe';
import { LazyIconPipe } from '../../../pipes/pipes/lazy-icon.pipe';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { NodeTypeIconPipe } from '../../../pipes/pipes/node-type-icon.pipe';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';
import { ClipboardDirective } from '../../../core/clipboard.directive';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzListModule } from 'ng-zorro-antd/list';
import { MapComponent } from '../map/map.component';
import { NgIf, NgFor, AsyncPipe, DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-navigation-map',
    templateUrl: './navigation-map.component.html',
    styleUrls: ['./navigation-map.component.less'],
    standalone: true,
    imports: [NgIf, MapComponent, NgFor, NzListModule, NzToolTipModule, ClipboardDirective, FlexModule, NzButtonModule, NzWaveModule, NzIconModule, AsyncPipe, DecimalPipe, NodeTypeIconPipe, XivapiIconPipe, LazyIconPipe, LazyRowPipe, I18nPipe, TranslateModule, I18nRowPipe]
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
    this.listsFacade.setItemDone({
      itemId: step.itemId,
      itemIcon: step.iconid,
      finalItem: step.finalItem,
      delta: step.item_amount,
      recipeId: null,
      totalNeeded: step.total_item_amount
    });
  }

}
