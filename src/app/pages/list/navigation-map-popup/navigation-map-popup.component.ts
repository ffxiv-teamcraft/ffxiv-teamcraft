import {ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {Vector2} from '../../../core/tools/vector2';
import {NavigationStep} from '../../../modules/map/navigation-step';
import {Observable} from 'rxjs/Observable';
import {MapService} from '../../../modules/map/map.service';
import {MapData} from '../../../modules/map/map-data';
import {ComponentWithSubscriptions} from '../../../core/component/component-with-subscriptions';
import {NavigationObjective} from '../../../modules/map/navigation-objective';

@Component({
    selector: 'app-navigation-map-popup',
    templateUrl: './navigation-map-popup.component.html',
    styleUrls: ['./navigation-map-popup.component.scss'],
})
export class NavigationMapPopupComponent extends ComponentWithSubscriptions implements OnInit {

    public navigationMap: Observable<NavigationStep[]>;

    private map: MapData;

    @ViewChild('container')
    public containerRef: ElementRef;

    constructor(@Inject(MAT_DIALOG_DATA) public data: { mapId: number, points: NavigationObjective[], startPoint?: NavigationObjective },
                private mapService: MapService) {
        super();
    }

    ngOnInit(): void {
        this.subscriptions.push(this.mapService.getMapById(this.data.mapId).subscribe(map => {
            this.map = map;
        }));
        this.navigationMap = this.mapService.getOptimizedPath(this.data.mapId, this.data.points, this.data.startPoint);
    }

    getPosition(coords: Vector2): Vector2 {
        const positionPercents = this.mapService.getPositionOnMap(this.map, coords);
        return {
            x: positionPercents.x * this.containerRef.nativeElement.offsetWidth / 100,
            y: positionPercents.y * this.containerRef.nativeElement.offsetHeight / 100
        };
    }

}
